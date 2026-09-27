import React from 'react';
import { ArrowRight, Calculator, ShieldCheck, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onCheckLoan: () => void;
  onCalculateEmi: () => void;
  onConsultAi: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onCheckLoan,
  onCalculateEmi,
  onConsultAi,
}) => {
  return (
    <div className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-20">
      {/* Subtle Glowing Background Accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[650px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-indigo-600/15 to-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-48 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="pointer-events-none absolute top-32 -right-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1.5 text-xs text-cyan-300 backdrop-blur-md shadow-sm mb-6">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Next-Gen Financial Intelligence</span>
          <span className="h-1 w-1 rounded-full bg-cyan-400" />
          <span className="text-slate-300">Underwriting Estimates & AI Advisory</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Smart Financial Decisions,{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Powered by AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Check your loan eligibility, calculate EMIs, understand your credit profile, and get
          personalized financial insights.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
          <button
            id="hero-cta-check-loan"
            onClick={onCheckLoan}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 transition-all duration-200 active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Check Loan Eligibility</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            id="hero-cta-calculate-emi"
            onClick={onCalculateEmi}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-slate-900/70 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md hover:bg-slate-800/90 hover:border-white/30 hover:text-white transition-all duration-200 active:scale-[0.98]"
          >
            <Calculator className="h-4 w-4 text-cyan-400" />
            <span>Calculate EMI</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Standard Banking Underwriting Logic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Real-time Amortization Schedules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Claude & Gemini AI Advisory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Optional Cloud / Google Sheets Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};
