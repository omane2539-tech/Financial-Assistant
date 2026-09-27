import React, { useState, useMemo } from 'react';
import {
  Calculator,
  RotateCcw,
  Sparkles,
  Database,
  PieChart,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  Percent,
} from 'lucide-react';
import { EmiInput, TenureUnit } from '../types';
import { calculateEmi, formatCurrency, formatPercent } from '../utils/calculations';

interface EmiCalculatorModuleProps {
  initialValues?: { amount: number; rate: number; tenureYears: number } | null;
  onSaveRecord: (record: any) => Promise<boolean>;
  onConsultAi: (context: {
    goal: string;
    income?: number;
    score?: number;
    emi?: number;
    loan?: number;
    extraContext?: string;
  }) => void;
  onTrackAction?: (type: string, meta?: any) => void;
}

export const EmiCalculatorModule: React.FC<EmiCalculatorModuleProps> = ({
  initialValues,
  onSaveRecord,
  onConsultAi,
  onTrackAction,
}) => {
  const defaultValues: EmiInput = {
    loanAmount: initialValues?.amount || 50000,
    interestRate: initialValues?.rate || 8.5,
    tenure: initialValues ? initialValues.tenureYears : 5,
    tenureUnit: 'Years',
  };

  const [input, setInput] = useState<EmiInput>(defaultValues);
  const [showAmortization, setShowAmortization] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Real-time dynamic recalculation
  const emiResult = useMemo(() => {
    return calculateEmi(input);
  }, [input]);

  const handleInputChange = (field: keyof EmiInput, value: any) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    setSavedMsg(null);
    onTrackAction?.('emi', {
      detail: `Adjusted EMI parameters to ${formatCurrency(input.loanAmount)} @ ${input.interestRate}%.`,
    });
  };

  const handleReset = () => {
    setInput({
      loanAmount: 50000,
      interestRate: 8.5,
      tenure: 5,
      tenureUnit: 'Years',
    });
    setSavedMsg(null);
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSavedMsg(null);
    const months = input.tenureUnit === 'Years' ? input.tenure * 12 : input.tenure;
    try {
      const success = await onSaveRecord({
        userName: 'EMI Simulation',
        income: emiResult.monthlyEmi * 2.5, // estimated healthy minimum income
        creditScore: 720,
        loanAmount: input.loanAmount,
        loanTenureMonths: months,
        emi: emiResult.monthlyEmi,
        eligibilityResult: 'Calculated',
        riskCategory: 'Moderate',
        source: 'EMI Calculator',
      });
      if (success) {
        setSavedMsg('Calculation recorded to financial records successfully!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAskAi = () => {
    onConsultAi({
      goal: `How can I optimize and accelerate payment of my ${formatCurrency(
        input.loanAmount
      )} loan with an EMI of ${formatCurrency(emiResult.monthlyEmi)}/month?`,
      emi: emiResult.monthlyEmi,
      loan: input.loanAmount,
      extraContext: `Interest Rate: ${input.interestRate}%, Tenure: ${input.tenure} ${
        input.tenureUnit
      }. Total interest will be ${formatCurrency(emiResult.totalInterest)} (${formatPercent(
        emiResult.interestPercentage
      )} of total payout).`,
    });
  };

  // SVG Donut Chart Geometry
  const radius = 64;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const principalOffset = circumference - (circumference * emiResult.principalPercentage) / 100;
  const interestOffset = circumference - (circumference * emiResult.interestPercentage) / 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-indigo-500/15 p-2 border border-indigo-500/30 text-indigo-400">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Real-Time EMI Calculator</h1>
            <p className="text-xs text-slate-400">
              Standard annuity amortization formula • Instant reactive slider & numeric inputs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Loan & Tenure Specifications
            </h2>
            <p className="text-xs text-slate-400">
              Move sliders or enter exact values to see live amortization changes
            </p>
          </div>

          {/* 1. Loan Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="emi-loan-amount" className="text-xs font-semibold text-slate-300">
                Principal Loan Amount ($)
              </label>
              <div className="relative w-36">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                <input
                  id="emi-loan-amount"
                  type="number"
                  min="0"
                  max="5000000"
                  step="1000"
                  value={input.loanAmount}
                  onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
                  className="glass-input w-full rounded-lg pl-6 pr-2 py-1 text-right text-sm font-bold text-white"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={input.loanAmount}
              onChange={(e) => handleInputChange('loanAmount', Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>$1,000</span>
              <span>$500,000</span>
              <span>$1,000,000</span>
            </div>
          </div>

          {/* 2. Annual Interest Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="emi-interest-rate" className="text-xs font-semibold text-slate-300">
                Annual Interest Rate (% p.a.)
              </label>
              <div className="relative w-28">
                <input
                  id="emi-interest-rate"
                  type="number"
                  min="0"
                  max="35"
                  step="0.1"
                  value={input.interestRate}
                  onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                  className="glass-input w-full rounded-lg pl-2 pr-6 py-1 text-right text-sm font-bold text-cyan-300"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.25"
              value={input.interestRate}
              onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
              className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0% (Zero-interest)</span>
              <span>12.5%</span>
              <span>25%</span>
            </div>
          </div>

          {/* 3. Loan Tenure with Unit Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="emi-tenure-input" className="text-xs font-semibold text-slate-300">
                Repayment Tenure
              </label>
              <div className="flex items-center gap-2">
                <div className="w-24">
                  <input
                    id="emi-tenure-input"
                    type="number"
                    min="1"
                    max={input.tenureUnit === 'Years' ? 35 : 420}
                    value={input.tenure}
                    onChange={(e) => handleInputChange('tenure', Number(e.target.value))}
                    className="glass-input w-full rounded-lg px-2 py-1 text-right text-sm font-bold text-white"
                  />
                </div>
                {/* Months vs Years Unit Toggle */}
                <div className="flex rounded-lg border border-white/10 bg-slate-950 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (input.tenureUnit !== 'Years') {
                        setInput((prev) => ({
                          ...prev,
                          tenureUnit: 'Years',
                          tenure: Math.max(1, Math.round(prev.tenure / 12)),
                        }));
                      }
                    }}
                    className={`rounded-md px-2.5 py-0.5 font-medium transition-colors ${
                      input.tenureUnit === 'Years'
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Yr
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (input.tenureUnit !== 'Months') {
                        setInput((prev) => ({
                          ...prev,
                          tenureUnit: 'Months',
                          tenure: Math.max(1, prev.tenure * 12),
                        }));
                      }
                    }}
                    className={`rounded-md px-2.5 py-0.5 font-medium transition-colors ${
                      input.tenureUnit === 'Months'
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Mo
                  </button>
                </div>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max={input.tenureUnit === 'Years' ? 30 : 360}
              step="1"
              value={input.tenure}
              onChange={(e) => handleInputChange('tenure', Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{input.tenureUnit === 'Years' ? '1 Year' : '1 Month'}</span>
              <span>{input.tenureUnit === 'Years' ? '15 Years' : '180 Months'}</span>
              <span>{input.tenureUnit === 'Years' ? '30 Years' : '360 Months'}</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Common Financing Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setInput({
                    loanAmount: 35000,
                    interestRate: 6.5,
                    tenure: 5,
                    tenureUnit: 'Years',
                  })
                }
                className="rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
              >
                Auto Loan ($35k @ 6.5%)
              </button>
              <button
                type="button"
                onClick={() =>
                  setInput({
                    loanAmount: 350000,
                    interestRate: 6.9,
                    tenure: 30,
                    tenureUnit: 'Years',
                  })
                }
                className="rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
              >
                30-Yr Home Mortgage ($350k)
              </button>
              <button
                type="button"
                onClick={() =>
                  setInput({
                    loanAmount: 15000,
                    interestRate: 11.2,
                    tenure: 3,
                    tenureUnit: 'Years',
                  })
                }
                className="rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300 hover:border-purple-500/40 hover:text-purple-300 transition-colors"
              >
                Personal Loan ($15k @ 11.2%)
              </button>
              <button
                type="button"
                onClick={() =>
                  setInput({
                    loanAmount: 6000,
                    interestRate: 0,
                    tenure: 12,
                    tenureUnit: 'Months',
                  })
                }
                className="rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
              >
                0% Promotional (12 Mo)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Result Card & Donut Chart (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            id="emi-results-card"
            className="rounded-2xl border border-indigo-500/40 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl shadow-indigo-950/40 relative overflow-hidden"
          >
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />

            {/* Prominent Monthly Installment Display */}
            <div className="text-center pb-5 border-b border-white/10">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Computed Monthly EMI
              </span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="font-display text-4xl font-extrabold tracking-tight text-white">
                  {formatCurrency(emiResult.monthlyEmi)}
                </span>
                <span className="text-sm font-semibold text-cyan-400">/ month</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {input.interestRate === 0
                  ? 'Zero-interest equal monthly amortization'
                  : `Standard compound interest based on ${input.interestRate}% annual APR`}
              </p>
            </div>

            {/* Visual SVG Donut Chart */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 160 160">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-800"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Principal Segment (Cyan) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-cyan-400 transition-all duration-300"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={principalOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  {/* Interest Segment (Indigo/Purple) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-indigo-500 transition-all duration-300"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={interestOffset}
                    strokeDashoffset-delay="100ms"
                    strokeLinecap="round"
                    fill="transparent"
                    style={{
                      transform: `rotate(${((100 - emiResult.interestPercentage) / 100) * 360}deg)`,
                      transformOrigin: 'center',
                    }}
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Cost</span>
                  <span className="font-display text-sm font-bold text-white">
                    {formatCurrency(emiResult.totalPayment)}
                  </span>
                </div>
              </div>

              {/* Chart Legend with Percentages */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">
                    Principal: <strong>{formatPercent(emiResult.principalPercentage)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-indigo-500" />
                  <span className="text-slate-300">
                    Interest: <strong>{formatPercent(emiResult.interestPercentage)}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Figures Breakdown Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
              <div>
                <span className="text-[11px] text-slate-400">Principal Amount</span>
                <p className="font-display text-sm font-bold text-cyan-300 mt-0.5">
                  {formatCurrency(emiResult.principalAmount)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Interest Payable</span>
                <p className="font-display text-sm font-bold text-indigo-400 mt-0.5">
                  {formatCurrency(emiResult.totalInterest)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Payout (P + I)</span>
                <p className="font-display text-sm font-bold text-white mt-0.5">
                  {formatCurrency(emiResult.totalPayment)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Total Installments</span>
                <p className="font-display text-sm font-bold text-slate-300 mt-0.5">
                  {input.tenureUnit === 'Years' ? input.tenure * 12 : input.tenure} Months
                </p>
              </div>
            </div>

            {/* Saved Notification */}
            {savedMsg && (
              <div className="mt-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300 text-center animate-in fade-in">
                {savedMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 space-y-2.5 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-save-emi-record"
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/70 transition-colors disabled:opacity-50"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Calculation'}</span>
                </button>

                <button
                  id="btn-toggle-amortization"
                  type="button"
                  onClick={() => setShowAmortization(!showAmortization)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{showAmortization ? 'Hide Schedule' : 'View Schedule'}</span>
                </button>
              </div>

              <button
                id="btn-ask-ai-emi"
                type="button"
                onClick={handleAskAi}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI to Optimize This EMI</span>
              </button>
            </div>
          </div>

          {/* Amortization Schedule Preview Drawer */}
          {showAmortization && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 backdrop-blur-xl shadow-xl animate-in fade-in duration-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Yearly Amortization Schedule
              </h3>
              <div className="max-h-56 overflow-y-auto pr-1 text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                      <th className="py-1.5">Year</th>
                      <th className="py-1.5">Principal</th>
                      <th className="py-1.5">Interest</th>
                      <th className="py-1.5 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {emiResult.amortizationPreview.map((row) => (
                      <tr key={row.year} className="hover:bg-white/5 transition-colors">
                        <td className="py-1.5 font-medium text-slate-300">Yr {row.year}</td>
                        <td className="py-1.5 text-cyan-400">{formatCurrency(row.principalPaid)}</td>
                        <td className="py-1.5 text-indigo-400">{formatCurrency(row.interestPaid)}</td>
                        <td className="py-1.5 text-right font-medium text-slate-200">
                          {formatCurrency(row.remainingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
