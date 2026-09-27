import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  PiggyBank,
  Wallet,
  Compass,
  FileText,
  Info,
  Layers,
} from 'lucide-react';
import { FinancialAdviceResponse } from '../types';
import { generateDeterministicAdvice } from '../utils/advisoryEngine';

interface AiFinancialTipsModuleProps {
  initialContext?: {
    goal?: string;
    income?: number;
    score?: number;
    emi?: number;
    loan?: number;
    extraContext?: string;
  } | null;
  onTrackAction?: (type: string, meta?: any) => void;
}

export const AiFinancialTipsModule: React.FC<AiFinancialTipsModuleProps> = ({
  initialContext,
  onTrackAction,
}) => {
  const [goal, setGoal] = useState<string>(
    initialContext?.goal || 'I want to buy a car and need advice on structuring the loan without stressing my budget.'
  );
  const [monthlyIncome, setMonthlyIncome] = useState<number>(initialContext?.income || 6500);
  const [creditScore, setCreditScore] = useState<number>(initialContext?.score || 725);
  const [existingEmi, setExistingEmi] = useState<number>(initialContext?.emi || 450);
  const [requestedLoan, setRequestedLoan] = useState<number>(initialContext?.loan || 35000);
  const [showParameters, setShowParameters] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<FinancialAdviceResponse | null>(null);

  const presetGoals = [
    'I want to buy a car.',
    'How can I reduce my monthly EMI?',
    'How can I improve my credit profile?',
    'How much should I save every month?',
    'Should I consolidate my existing personal loans?',
  ];

  const handleSelectPreset = (preset: string) => {
    setGoal(preset);
  };

  const handleGenerateAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) {
      setError('Please provide a financial goal or question.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          monthlyIncome,
          creditScore,
          existingEmi,
          requestedLoan,
          extraContext: initialContext?.extraContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate financial guidance.');
      }

      const data: FinancialAdviceResponse = await response.json();
      setAdvice(data);
      onTrackAction?.('ai', {
        detail: `Generated AI advisory for "${goal.slice(0, 40)}..." (${data.provider}).`,
      });
    } catch (err: any) {
      try {
        const dti = monthlyIncome > 0 ? (existingEmi / monthlyIncome) * 100 : 0;
        const fallbackAdvice = generateDeterministicAdvice({
          goal,
          income: monthlyIncome,
          score: creditScore,
          emi: existingEmi,
          loan: requestedLoan,
          dti,
        });
        setAdvice(fallbackAdvice as FinancialAdviceResponse);
        onTrackAction?.('ai', {
          detail: `Generated advisory for "${goal.slice(0, 40)}..." (FinSmart Engine).`,
        });
      } catch (fallbackErr: any) {
        setError(
          err.message || 'An error occurred while compiling financial guidance. Please retry.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-purple-500/15 p-2 border border-purple-500/30 text-purple-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">AI Financial Advisor</h1>
            <p className="text-xs text-slate-400">
              Powered by Anthropic Claude & Gemini AI • Rigorous personalized financial blueprints
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowParameters(!showParameters)}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Layers className="h-3.5 w-3.5 text-purple-400" />
          <span>{showParameters ? 'Hide Financial Context' : 'Edit Financial Context'}</span>
        </button>
      </div>

      {/* Goal Input & Quick Chips */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
        {/* Preset Chips */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Suggested Financial Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {presetGoals.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`rounded-xl border px-3 py-1.5 text-xs transition-all ${
                  goal === preset
                    ? 'border-purple-500/60 bg-purple-950/40 text-purple-200 shadow-sm'
                    : 'border-white/10 bg-slate-950/50 text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Goal Textarea */}
        <div>
          <label htmlFor="ai-goal-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Your Financial Goal or Question *
          </label>
          <textarea
            id="ai-goal-input"
            rows={3}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. I want to purchase a new home within 18 months, what are the best steps to improve my debt-to-income ratio and save for closing costs?"
            className="glass-input w-full rounded-xl p-3.5 text-sm text-white placeholder:text-slate-500"
          />
        </div>

        {/* Non-Sensitive Context Fields */}
        {showParameters && (
          <div className="pt-2 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
            <div>
              <label htmlFor="ai-context-income" className="block text-[11px] text-slate-400 mb-1">
                Monthly Income ($)
              </label>
              <input
                id="ai-context-income"
                type="number"
                min="0"
                step="250"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="glass-input w-full rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label htmlFor="ai-context-score" className="block text-[11px] text-slate-400 mb-1">
                Credit Score
              </label>
              <input
                id="ai-context-score"
                type="number"
                min="300"
                max="850"
                value={creditScore}
                onChange={(e) => setCreditScore(Number(e.target.value))}
                className="glass-input w-full rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label htmlFor="ai-context-emi" className="block text-[11px] text-slate-400 mb-1">
                Existing EMI ($)
              </label>
              <input
                id="ai-context-emi"
                type="number"
                min="0"
                step="50"
                value={existingEmi}
                onChange={(e) => setExistingEmi(Number(e.target.value))}
                className="glass-input w-full rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label htmlFor="ai-context-loan" className="block text-[11px] text-slate-400 mb-1">
                Target Loan/Expense ($)
              </label>
              <input
                id="ai-context-loan"
                type="number"
                min="0"
                step="1000"
                value={requestedLoan}
                onChange={(e) => setRequestedLoan(Number(e.target.value))}
                className="glass-input w-full rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Submit Button & Error Alert */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>Private & confidential. No SSN, account numbers, or login credentials required.</span>
          </p>

          <button
            id="btn-generate-ai-guidance"
            type="button"
            onClick={() => handleGenerateAdvice()}
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Formulating Financial Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate AI Guidance</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 p-8 backdrop-blur-xl shadow-xl text-center space-y-4 animate-pulse">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-white">
              Synthesizing Multi-Factor Financial Guidance
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Evaluating debt amortization models, DTI thresholds, and credit bureau scoring factors
              to generate your structured advice...
            </p>
          </div>
        </div>
      )}

      {/* AI Advisory Results Layout */}
      {advice && !isLoading && (
        <div
          id="ai-guidance-results-card"
          className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <h2 className="font-display text-base font-bold text-white">Executive Financial Assessment</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-0.5 text-xs font-semibold text-purple-300">
                  {advice.provider}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-200 leading-relaxed font-normal">
              {advice.summary}
            </p>
          </div>

          {/* Core Categories Grid (4 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Personalized Tips */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Wallet className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Personalized Recommendations
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {advice.personalizedTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Loan Repayment Suggestions */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <TrendingDown className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Loan Repayment & EMI Acceleration
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {advice.loanRepaymentSuggestions.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Budgeting & Savings Guidance */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <PiggyBank className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Budgeting & Liquidity Allocation
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {advice.budgetingSuggestions.concat(advice.savingsGuidance).slice(0, 4).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Financial Risk Warnings */}
            <div className="rounded-2xl border border-rose-500/20 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Risk Warnings & Hazards
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {advice.riskWarnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Steps Blueprint */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-5 w-5 text-cyan-400" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                Chronological Action Steps
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {advice.actionSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl border border-white/5 bg-slate-950/60 p-4 text-xs space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-display font-bold flex items-center justify-center text-xs">
                      {step.step}
                    </span>
                    <h4 className="font-semibold text-slate-100">{step.title}</h4>
                  </div>
                  <p className="text-slate-400 leading-relaxed pl-8">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions & Educational Disclaimer */}
          <div className="space-y-3">
            {advice.assumptions && advice.assumptions.length > 0 && (
              <div className="text-xs text-slate-400 bg-slate-950/40 border border-white/5 rounded-xl p-4">
                <span className="font-semibold text-slate-300 block mb-1">
                  Modeling Assumptions Used:
                </span>
                <ul className="list-disc list-inside space-y-0.5">
                  {advice.assumptions.map((assump, i) => (
                    <li key={i}>{assump}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mandatory Disclaimer */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-300/90 leading-normal flex items-start gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Mandatory Disclaimer:</strong> {advice.disclaimer} Always consult a licensed
                financial planner, certified accountant, or official lending officer before making binding
                financial commitments.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
