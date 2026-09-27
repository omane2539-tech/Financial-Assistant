import React from 'react';
import {
  ShieldCheck,
  Calculator,
  CreditCard,
  Database,
  ArrowUpRight,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { DashboardStats as IDashboardStats } from '../types';

interface DashboardStatsProps {
  stats: IDashboardStats;
  onNavigate: (tab: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, onNavigate }) => {
  const statCards = [
    {
      id: 'stat-loan-checks',
      title: 'Loan Eligibility Checks',
      value: stats.totalLoanChecks,
      label: 'Simulations Run',
      icon: ShieldCheck,
      color: 'from-cyan-500/20 to-blue-500/10',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      actionTab: 'loan',
    },
    {
      id: 'stat-emi-calculations',
      title: 'EMI Calculations',
      value: stats.totalEmiCalculations,
      label: 'Amortizations Computed',
      icon: Calculator,
      color: 'from-indigo-500/20 to-purple-500/10',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      actionTab: 'emi',
    },
    {
      id: 'stat-avg-credit',
      title: 'Average Credit Score',
      value: stats.averageCreditScore > 0 ? stats.averageCreditScore : 'N/A',
      label: stats.averageCreditScore >= 720 ? 'Prime / Favorable' : 'Developing Tier',
      icon: CreditCard,
      color: 'from-emerald-500/20 to-teal-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      actionTab: 'credit',
    },
    {
      id: 'stat-saved-records',
      title: 'Financial Records',
      value: stats.totalRecords,
      label: 'Stored & Synchronized',
      icon: Database,
      color: 'from-amber-500/20 to-orange-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      actionTab: 'records',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              onClick={() => onNavigate(card.actionTab)}
              className={`group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.color} p-5 backdrop-blur-xl shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-white/30 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-slate-900/80 p-2.5 border border-white/10 shadow-inner">
                  <Icon className={`h-5 w-5 ${card.textColor}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </h3>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {card.value}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Launchpad & Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Launchpad (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Financial Tool Suite</h2>
              <p className="text-xs text-slate-400">Direct access to core computation and AI modules</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              id="dash-launch-loan"
              onClick={() => onNavigate('loan')}
              className="group rounded-xl border border-white/10 bg-slate-950/40 p-4 transition-all duration-200 hover:border-cyan-500/40 hover:bg-slate-900/80 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/15 p-2 border border-cyan-500/30 text-cyan-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Loan Eligibility Evaluator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Debt-to-Income (DTI), max loan capacity & underwriting risks.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="dash-launch-emi"
              onClick={() => onNavigate('emi')}
              className="group rounded-xl border border-white/10 bg-slate-950/40 p-4 transition-all duration-200 hover:border-indigo-500/40 hover:bg-slate-900/80 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/15 p-2 border border-indigo-500/30 text-indigo-400">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    Real-time EMI Calculator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standard installment formula, interest breakups & charts.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="dash-launch-credit"
              onClick={() => onNavigate('credit')}
              className="group rounded-xl border border-white/10 bg-slate-950/40 p-4 transition-all duration-200 hover:border-emerald-500/40 hover:bg-slate-900/80 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-500/15 p-2 border border-emerald-500/30 text-emerald-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    Credit Profile Diagnostic
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Revolving utilization, factor analysis & score meter.
                  </p>
                </div>
              </div>
            </div>

            <div
              id="dash-launch-ai"
              onClick={() => onNavigate('ai-tips')}
              className="group rounded-xl border border-white/10 bg-slate-950/40 p-4 transition-all duration-200 hover:border-purple-500/40 hover:bg-slate-900/80 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/15 p-2 border border-purple-500/30 text-purple-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    Claude & Gemini Financial Advisor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personalized guidance, debt reduction plans & action steps.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  Recent Activity
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">Live Session Feed</span>
            </div>

            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
              {stats.recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No activity recorded yet in this session.
                </div>
              ) : (
                stats.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-xl border border-white/5 bg-slate-950/50 p-3 text-xs hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-200">{act.title}</span>
                      <span>{act.timestamp}</span>
                    </div>
                    <p className="mt-1 text-slate-400 line-clamp-2 leading-relaxed">{act.detail}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <button
              onClick={() => onNavigate('records')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View All Saved Records →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
