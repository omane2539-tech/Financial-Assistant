import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  RotateCcw,
  Sparkles,
  Database,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Percent,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { CreditAnalysisInput, PaymentHistoryType } from '../types';
import { analyzeCreditScore, formatCurrency, formatPercent } from '../utils/calculations';
import { validateCreditForm, ValidationErrors } from '../utils/validation';

interface CreditScoreAnalyzerModuleProps {
  onSaveRecord: (record: any) => Promise<boolean>;
  onConsultAi: (context: {
    goal: string;
    income?: number;
    score?: number;
    emi?: number;
    extraContext?: string;
  }) => void;
  onTrackAction?: (type: string, meta?: any) => void;
}

export const CreditScoreAnalyzerModule: React.FC<CreditScoreAnalyzerModuleProps> = ({
  onSaveRecord,
  onConsultAi,
  onTrackAction,
}) => {
  const initialForm: CreditAnalysisInput = {
    creditScore: 715,
    monthlyIncome: 6000,
    existingEmi: 550,
    activeLoansCount: 2,
    creditUtilization: 28,
    paymentHistory: 'always_on_time',
  };

  const [form, setForm] = useState<CreditAnalysisInput>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreditAnalysisInput, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSavedMsg(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const analysis = useMemo(() => {
    return analyzeCreditScore(form);
  }, [form]);

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSavedMsg(null);
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSavedMsg(null);
    try {
      const success = await onSaveRecord({
        userName: 'Credit Diagnostic',
        income: form.monthlyIncome,
        creditScore: form.creditScore,
        loanAmount: form.existingEmi * 24, // estimated existing balance
        loanTenureMonths: 24,
        emi: form.existingEmi,
        eligibilityResult: analysis.scoreCategory,
        riskCategory: analysis.riskLevel,
        source: 'Credit Analysis',
      });
      if (success) {
        setSavedMsg('Credit diagnostic successfully saved to financial records!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAskAi = () => {
    onConsultAi({
      goal: `How can I improve my credit score from ${form.creditScore} (${analysis.scoreCategory}) to the 800+ tier?`,
      income: form.monthlyIncome,
      score: form.creditScore,
      emi: form.existingEmi,
      extraContext: `Current Utilization: ${form.creditUtilization}%, Active Loans: ${
        form.activeLoansCount
      }, Payment History: ${form.paymentHistory}. Risk level evaluated as ${analysis.riskLevel}.`,
    });
  };

  // SVG Gauge Calculations (180-degree semi-circle from 300 to 850)
  const minScore = 300;
  const maxScore = 850;
  const clampedScore = Math.min(maxScore, Math.max(minScore, form.creditScore));
  const scorePercent = (clampedScore - minScore) / (maxScore - minScore);
  const gaugeAngle = -90 + scorePercent * 180; // -90 deg to +90 deg

  const tierColor =
    analysis.scoreCategory === 'Excellent'
      ? 'text-emerald-400'
      : analysis.scoreCategory === 'Good'
      ? 'text-cyan-400'
      : analysis.scoreCategory === 'Fair'
      ? 'text-amber-400'
      : 'text-rose-400';

  const tierBadgeBg =
    analysis.scoreCategory === 'Excellent'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : analysis.scoreCategory === 'Good'
      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      : analysis.scoreCategory === 'Fair'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-emerald-500/15 p-2 border border-emerald-500/30 text-emerald-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Credit Score Profile Analyzer</h1>
            <p className="text-xs text-slate-400">
              Evaluates utilization velocity, payment health & credit bureau tiering
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Parameter Inputs (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Credit Metrics & Liabilities
            </h2>
            <p className="text-xs text-slate-400">
              Adjust sliders or input parameters to explore potential score sensitivity
            </p>
          </div>

          {/* 1. Credit Score Slider & Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="credit-input-score" className="text-xs font-semibold text-slate-300">
                Credit Score (FICO / Vantage equivalent)
              </label>
              <div className="w-24">
                <input
                  id="credit-input-score"
                  type="number"
                  min="300"
                  max="850"
                  value={form.creditScore}
                  onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
                  className="glass-input w-full rounded-lg px-2 py-1 text-right text-sm font-bold text-white"
                />
              </div>
            </div>
            <input
              type="range"
              min="300"
              max="850"
              step="5"
              value={form.creditScore}
              onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="text-rose-400 font-medium">300 (Poor)</span>
              <span className="text-amber-400 font-medium">620 (Fair)</span>
              <span className="text-cyan-400 font-medium">700 (Good)</span>
              <span className="text-emerald-400 font-medium">850 (Exceptional)</span>
            </div>
          </div>

          {/* 2. Monthly Income & Existing Debt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="credit-income" className="block text-xs font-semibold text-slate-300 mb-1">
                Gross Monthly Income ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  id="credit-income"
                  type="number"
                  min="500"
                  step="250"
                  value={form.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                  className="glass-input w-full rounded-xl pl-8 pr-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="credit-emi" className="block text-xs font-semibold text-slate-300 mb-1">
                Existing Monthly EMI / Debt ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  id="credit-emi"
                  type="number"
                  min="0"
                  step="50"
                  value={form.existingEmi}
                  onChange={(e) => handleInputChange('existingEmi', Number(e.target.value))}
                  className="glass-input w-full rounded-xl pl-8 pr-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Revolving Credit Utilization % Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="credit-utilization-input" className="text-xs font-semibold text-slate-300">
                Revolving Credit Utilization (%)
              </label>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  form.creditUtilization < 30
                    ? 'text-emerald-400 bg-emerald-500/15'
                    : form.creditUtilization <= 50
                    ? 'text-amber-400 bg-amber-500/15'
                    : 'text-rose-400 bg-rose-500/15'
                }`}
              >
                {form.creditUtilization}% ({analysis.utilizationHealth})
              </span>
            </div>
            <input
              id="credit-utilization-input"
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.creditUtilization}
              onChange={(e) => handleInputChange('creditUtilization', Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span className="text-emerald-400">30% (Recommended max)</span>
              <span>100%</span>
            </div>
          </div>

          {/* 4. Active Loans & Payment History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="credit-active-loans" className="block text-xs font-semibold text-slate-300 mb-1">
                Number of Active Loans / Credit Cards
              </label>
              <input
                id="credit-active-loans"
                type="number"
                min="0"
                max="25"
                value={form.activeLoansCount}
                onChange={(e) => handleInputChange('activeLoansCount', Number(e.target.value))}
                className="glass-input w-full rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="credit-payment-history" className="block text-xs font-semibold text-slate-300 mb-1">
                Historical Payment Discipline
              </label>
              <select
                id="credit-payment-history"
                value={form.paymentHistory}
                onChange={(e) =>
                  handleInputChange('paymentHistory', e.target.value as PaymentHistoryType)
                }
                className="glass-input w-full rounded-xl px-3 py-2 text-sm text-white bg-slate-900"
              >
                <option value="always_on_time">Flawless (100% On-Time)</option>
                <option value="minor_delays">Minor Delays (1-2 30-day lates)</option>
                <option value="frequent_delays">Frequent Delays (60+ days delinquent)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Score Meter & Diagnostic Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            id="credit-score-diagnostic-card"
            className="rounded-2xl border border-emerald-500/40 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl shadow-emerald-950/40 relative overflow-hidden"
          >
            {/* Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500" />

            {/* Score Category Header */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Credit Tier
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${tierBadgeBg}`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {analysis.scoreCategory}
                  </span>
                  <span className="text-xs text-slate-400">({analysis.scoreRange})</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Risk Profile</span>
                <span
                  className={`text-xs font-bold ${
                    analysis.riskLevel === 'Low'
                      ? 'text-emerald-400'
                      : analysis.riskLevel === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {analysis.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Circular Gauge Needle Visualization */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-52 h-28 overflow-hidden">
                <svg className="w-52 h-52 -rotate-90 transform" viewBox="0 0 200 200">
                  {/* Outer track */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  {/* Gradient colored Arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * scorePercent)}
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="35%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score Number Display */}
                <div className="absolute bottom-0 text-center">
                  <span className="font-display text-4xl font-extrabold tracking-tight text-white">
                    {form.creditScore}
                  </span>
                  <span className="text-[11px] text-slate-400 block -mt-0.5">Points (FICO)</span>
                </div>
              </div>
            </div>

            {/* Metrics Snapshot */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs">
              <div>
                <span className="text-[11px] text-slate-400">Revolving Utilization</span>
                <p className="font-bold text-slate-200 mt-0.5">{form.creditUtilization}%</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Debt Ratio (DTI)</span>
                <p className="font-bold text-slate-200 mt-0.5">{analysis.dti}%</p>
              </div>
            </div>

            {/* Positive Factors */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block">
                Positive Profile Factors:
              </span>
              {analysis.positiveFactors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Risk Factors */}
            {analysis.riskFactors.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block">
                  Potential Risk Exposures:
                </span>
                {analysis.riskFactors.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Improvement Actions */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300 block">
                Recommended Action Steps:
              </span>
              {analysis.suggestedActions.slice(0, 3).map((act, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-slate-950/50 p-2 border border-white/5 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="h-4 w-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span>{act}</span>
                </div>
              ))}
            </div>

            {/* Mandatory Educational Disclaimer */}
            <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-300/90 leading-normal flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Educational Notice:</strong> The analysis is an educational estimate and does
                not replace an official credit bureau report. Official scores are formulated directly
                by bureaus (Experian, Equifax, TransUnion).
              </span>
            </div>

            {/* Saved Banner */}
            {savedMsg && (
              <div className="mt-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300 text-center animate-in fade-in">
                {savedMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 space-y-2 pt-3 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-save-credit-record"
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/70 transition-colors disabled:opacity-50"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>

                <button
                  id="btn-ask-ai-credit"
                  type="button"
                  onClick={handleAskAi}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2.5 text-xs font-semibold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Score Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
