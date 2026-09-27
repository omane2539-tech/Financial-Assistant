import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Database,
  Calculator,
  RotateCcw,
  TrendingUp,
  Percent,
  DollarSign,
  Briefcase,
  Calendar,
  User,
  Info,
} from 'lucide-react';
import { EmploymentType, LoanEligibilityInput, LoanEligibilityResult } from '../types';
import { evaluateLoanEligibility, formatCurrency } from '../utils/calculations';
import { validateLoanForm, ValidationErrors } from '../utils/validation';

interface LoanEligibilityModuleProps {
  onSaveRecord: (record: any) => Promise<boolean>;
  onConsultAi: (context: {
    goal: string;
    income: number;
    score: number;
    emi: number;
    loan: number;
    extraContext?: string;
  }) => void;
  onOpenEmi: (params: { amount: number; rate: number; tenureYears: number }) => void;
  onTrackAction?: (type: string, meta?: any) => void;
}

export const LoanEligibilityModule: React.FC<LoanEligibilityModuleProps> = ({
  onSaveRecord,
  onConsultAi,
  onOpenEmi,
  onTrackAction,
}) => {
  const initialForm: LoanEligibilityInput = {
    fullName: '',
    age: 29,
    monthlyIncome: 6500,
    employmentType: 'Salaried',
    employmentExperience: 4,
    existingEmi: 450,
    desiredLoanAmount: 45000,
    desiredLoanTenureYears: 5,
    creditScore: 740,
  };

  const [form, setForm] = useState<LoanEligibilityInput>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<LoanEligibilityResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoanEligibilityInput, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear error for that field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFillSample = () => {
    setForm({
      fullName: 'Alexander Wright',
      age: 34,
      monthlyIncome: 8200,
      employmentType: 'Salaried',
      employmentExperience: 6,
      existingEmi: 620,
      desiredLoanAmount: 60000,
      desiredLoanTenureYears: 5,
      creditScore: 755,
    });
    setErrors({});
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setResult(null);
    setSaveSuccessMsg(null);
  };

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLoanForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const res = evaluateLoanEligibility(form);
    setResult(res);
    setSaveSuccessMsg(null);

    onTrackAction?.('loan', {
      detail: `${form.fullName || 'User'} evaluated loan eligibility for ${formatCurrency(
        form.desiredLoanAmount
      )} (${res.status}).`,
    });
  };

  const handleSaveToCloud = async () => {
    if (!result) return;
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const success = await onSaveRecord({
        userName: form.fullName,
        age: form.age,
        income: form.monthlyIncome,
        employmentType: form.employmentType,
        creditScore: form.creditScore,
        loanAmount: form.desiredLoanAmount,
        loanTenureMonths: form.desiredLoanTenureYears * 12,
        emi: result.estimatedNewEmi,
        eligibilityResult: result.status,
        riskCategory: result.riskCategory,
        source: 'Loan Eligibility',
      });
      if (success) {
        setSaveSuccessMsg('Assessment successfully recorded to financial database!');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendToAi = () => {
    if (!result) return;
    onConsultAi({
      goal: `Financing advice for my desired loan of ${formatCurrency(form.desiredLoanAmount)} over ${
        form.desiredLoanTenureYears
      } years`,
      income: form.monthlyIncome,
      score: form.creditScore,
      emi: form.existingEmi,
      loan: form.desiredLoanAmount,
      extraContext: `Status evaluated as ${result.status} with DTI of ${result.debtToIncomeRatio}% and estimated new EMI of ${formatCurrency(
        result.estimatedNewEmi
      )}. Employment: ${form.employmentType} (${form.employmentExperience} yrs).`,
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-cyan-500/15 p-2 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Loan Eligibility Evaluator</h1>
              <p className="text-xs text-slate-400">
                Institutional underwriting algorithm based on DTI, income stability & credit tier
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillSample}
            className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition-colors"
          >
            Fill Sample Data
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Column (7 cols) */}
        <form
          id="loan-eligibility-form"
          onSubmit={handleEvaluate}
          className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5"
        >
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Applicant & Loan Parameters
            </h2>
            <p className="text-xs text-slate-400">Enter accurate figures for institutional estimation</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Marcus Alexander Vance"
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.fullName}
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-xs font-semibold text-slate-300 mb-1">
                Age (Years) *
              </label>
              <input
                id="age"
                type="number"
                min="18"
                max="80"
                value={form.age}
                onChange={(e) => handleInputChange('age', Number(e.target.value))}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              {errors.age && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.age}
                </p>
              )}
            </div>

            {/* Monthly Income */}
            <div>
              <label htmlFor="monthlyIncome" className="block text-xs font-semibold text-slate-300 mb-1">
                Gross Monthly Income ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  id="monthlyIncome"
                  type="number"
                  min="0"
                  step="100"
                  value={form.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                  className="glass-input w-full rounded-xl pl-8 pr-3 py-2.5 text-sm text-white"
                />
              </div>
              {errors.monthlyIncome && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.monthlyIncome}
                </p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label htmlFor="employmentType" className="block text-xs font-semibold text-slate-300 mb-1">
                Employment Classification *
              </label>
              <select
                id="employmentType"
                value={form.employmentType}
                onChange={(e) =>
                  handleInputChange('employmentType', e.target.value as EmploymentType)
                }
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white bg-slate-900"
              >
                <option value="Salaried">Salaried (Corporate / Public)</option>
                <option value="Self-employed">Self-Employed Professional</option>
                <option value="Business">Business Owner / Enterprise</option>
                <option value="Other">Other / Contract / Freelance</option>
              </select>
              {errors.employmentType && (
                <p className="mt-1 text-xs text-rose-400">{errors.employmentType}</p>
              )}
            </div>

            {/* Employment Experience */}
            <div>
              <label
                htmlFor="employmentExperience"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Work Experience (Years) *
              </label>
              <input
                id="employmentExperience"
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={form.employmentExperience}
                onChange={(e) => handleInputChange('employmentExperience', Number(e.target.value))}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              {errors.employmentExperience && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.employmentExperience}
                </p>
              )}
            </div>

            {/* Existing EMI */}
            <div>
              <label htmlFor="existingEmi" className="block text-xs font-semibold text-slate-300 mb-1">
                Existing Monthly Debt / EMI ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  id="existingEmi"
                  type="number"
                  min="0"
                  step="50"
                  value={form.existingEmi}
                  onChange={(e) => handleInputChange('existingEmi', Number(e.target.value))}
                  placeholder="0 if none"
                  className="glass-input w-full rounded-xl pl-8 pr-3 py-2.5 text-sm text-white"
                />
              </div>
              {errors.existingEmi && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.existingEmi}
                </p>
              )}
            </div>

            {/* Credit Score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="creditScore" className="text-xs font-semibold text-slate-300">
                  Credit Score (300-850) *
                </label>
                <span
                  className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                    form.creditScore >= 740
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : form.creditScore >= 670
                      ? 'text-cyan-400 bg-cyan-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                  }`}
                >
                  {form.creditScore >= 780
                    ? 'Excellent'
                    : form.creditScore >= 700
                    ? 'Good'
                    : form.creditScore >= 620
                    ? 'Fair'
                    : 'Poor'}
                </span>
              </div>
              <input
                id="creditScore"
                type="number"
                min="300"
                max="850"
                value={form.creditScore}
                onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              {errors.creditScore && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.creditScore}
                </p>
              )}
            </div>

            {/* Desired Loan Amount */}
            <div>
              <label htmlFor="desiredLoanAmount" className="block text-xs font-semibold text-slate-300 mb-1">
                Desired Loan Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  id="desiredLoanAmount"
                  type="number"
                  min="500"
                  step="1000"
                  value={form.desiredLoanAmount}
                  onChange={(e) => handleInputChange('desiredLoanAmount', Number(e.target.value))}
                  className="glass-input w-full rounded-xl pl-8 pr-3 py-2.5 text-sm text-white"
                />
              </div>
              {errors.desiredLoanAmount && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.desiredLoanAmount}
                </p>
              )}
            </div>

            {/* Desired Loan Tenure */}
            <div>
              <label
                htmlFor="desiredLoanTenureYears"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Desired Loan Tenure (Years) *
              </label>
              <input
                id="desiredLoanTenureYears"
                type="number"
                min="1"
                max="35"
                value={form.desiredLoanTenureYears}
                onChange={(e) => handleInputChange('desiredLoanTenureYears', Number(e.target.value))}
                className="glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-white"
              />
              {errors.desiredLoanTenureYears && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.desiredLoanTenureYears}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-evaluate-loan"
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 transition-all duration-200"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Evaluate Loan Eligibility</span>
            </button>
          </div>
        </form>

        {/* Results Card Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div
              id="loan-eligibility-result-card"
              className="rounded-2xl border border-cyan-500/40 bg-slate-900/80 p-6 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Top Accent Gradient */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  result.status === 'Eligible'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
                    : result.status === 'Potentially Eligible'
                    ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-400'
                }`}
              />

              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    Decision Estimate
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        result.status === 'Eligible'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : result.status === 'Potentially Eligible'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {result.status === 'Eligible' ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {result.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      • Risk:{' '}
                      <strong
                        className={
                          result.riskCategory === 'Low'
                            ? 'text-emerald-400'
                            : result.riskCategory === 'Moderate'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {result.riskCategory}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Estimated Rate</span>
                  <span className="font-display text-sm font-bold text-cyan-300">
                    {result.estimatedInterestRateMin}% – {result.estimatedInterestRateMax}%
                  </span>
                </div>
              </div>

              {/* Core Output Figures */}
              <div className="mt-5 grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-white/10">
                <div>
                  <span className="text-[11px] text-slate-400">Estimated New EMI</span>
                  <p className="font-display text-lg font-bold text-white mt-0.5">
                    {formatCurrency(result.estimatedNewEmi)}
                    <span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Max Estimated Loan</span>
                  <p className="font-display text-lg font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(result.maxEstimatedLoan)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Debt-to-Income (DTI)</span>
                  <p
                    className={`font-display text-sm font-bold mt-0.5 ${
                      result.debtToIncomeRatio <= 40
                        ? 'text-emerald-400'
                        : result.debtToIncomeRatio <= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {result.debtToIncomeRatio}%
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Total Monthly Debt</span>
                  <p className="font-display text-sm font-bold text-slate-200 mt-0.5">
                    {formatCurrency(result.totalMonthlyObligation)}/mo
                  </p>
                </div>
              </div>

              {/* Breakdown Summary */}
              <p className="mt-4 text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                {result.breakdownSummary}
              </p>

              {/* Factors Evaluated */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Underwriting Factors:
                </span>
                {result.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs rounded-lg p-2 bg-slate-950/40 border border-white/5"
                  >
                    {factor.status === 'good' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    ) : factor.status === 'warning' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <strong className="text-slate-200">{factor.name}: </strong>
                      <span className="text-slate-400">{factor.note}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Required Educational Disclaimer */}
              <div className="mt-5 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300/90 leading-normal flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Important Notice:</strong> This is an educational estimate and is not a
                  bank-approved loan decision. Official lending determinations require formal credit
                  pulls and underwriter verification.
                </span>
              </div>

              {/* Success Message Banner if saved */}
              {saveSuccessMsg && (
                <div className="mt-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-2 text-xs text-emerald-300 text-center animate-in fade-in">
                  {saveSuccessMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-save-loan-record"
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/50 px-3 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/70 transition-colors disabled:opacity-50"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save to Cloud'}</span>
                  </button>

                  <button
                    id="btn-open-in-emi"
                    type="button"
                    onClick={() =>
                      onOpenEmi({
                        amount: form.desiredLoanAmount,
                        rate: (result.estimatedInterestRateMin + result.estimatedInterestRateMax) / 2,
                        tenureYears: form.desiredLoanTenureYears,
                      })
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Calculator className="h-3.5 w-3.5 text-cyan-400" />
                    <span>EMI Schedule</span>
                  </button>
                </div>

                <button
                  id="btn-ask-ai-loan"
                  type="button"
                  onClick={handleSendToAi}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Get AI Guidance for this Loan</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty placeholder state */
            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-8 text-center backdrop-blur-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-white">
                Awaiting Assessment Inputs
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Fill out the applicant parameters on the left and click "Evaluate Loan Eligibility" to
                generate your institutional estimate, DTI analysis, and rate forecast.
              </p>
              <button
                type="button"
                onClick={handleFillSample}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Or test with sample values →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
