import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  FileSpreadsheet,
  Layers,
  Award,
  BookOpen,
  ArrowRight,
  Code,
  Sparkles,
} from 'lucide-react';

export const AboutModule: React.FC = () => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-cyan-500/15 p-2 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              About FinSmart AI – Financial Assistant
            </h1>
            <p className="text-xs text-slate-400">
              System architecture, algorithmic underpinnings, privacy notice & project roadmap
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-cyan-400" />
          <span>Project Overview & Engineering Purpose</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>FinSmart AI</strong> is a modern, responsive full-stack financial engineering
          application engineered to demystify institutional credit underwriting, calculate precise
          loan amortization installments, diagnose credit health factors, and provide automated AI
          financial advisory services.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Designed as a production-grade Computer Engineering milestone project, FinSmart AI
          prioritizes mathematical precision, data hygiene, and security. Private API credentials
          (Anthropic Claude, Gemini, Google Service Accounts) are strictly kept within a protected
          server-side Express proxy layer, never leaking to the browser client.
        </p>
      </div>

      {/* System Workflow Diagram (Requirement 21) */}
      <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>End-to-End System Workflow Architecture</span>
          </h2>
          <span className="text-[11px] text-slate-400">Interactive Data Flow</span>
        </div>

        {/* Visual ASCII / Structural Diagram */}
        <div className="overflow-x-auto p-4 bg-slate-950/80 rounded-xl border border-white/5 font-mono text-xs text-cyan-200">
          <pre className="whitespace-pre leading-relaxed text-slate-300">
{`                    ┌─────────────────────────────────────────┐
                    │                 User                    │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │          FinSmart AI Client UI          │
                    │   (Responsive Dark Glassmorphism)       │
                    └────────────────────┬────────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
   ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
   │  Loan Eligibility  │     │   EMI Calculator   │     │  Credit Analyzer   │
   │ (DTI, Risk Tier)   │     │ (Amortization SVG) │     │ (Score Meter & FX) │
   └──────────┬─────────┘     └──────────┬─────────┘     └──────────┬─────────┘
              │                          │                          │
              └──────────────────────────┼──────────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │      AI Financial Guidance Request      │
                    │   (Goal + Non-Sensitive Financial Data) │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │       Secure Backend API Gateway        │
                    │      (Node.js / Express Server)         │
                    └────────────────────┬────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
              ┌─────────────────────┐         ┌─────────────────────┐
              │  Anthropic Claude   │         │    Google Sheets    │
              │  & Gemini AI Engine │         │  Data Storage Layer │
              └─────────────────────┘         └─────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* Disclaimers & Privacy Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Financial Modeling Disclaimer
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All calculations, loan eligibility statuses, interest rate estimations, and AI insights
            provided by FinSmart AI are intended solely for educational, informational, and
            demonstration purposes.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            They do not represent bank-approved lending decisions, contractual credit commitments, or
            certified professional financial advice. Formal loan approvals are determined exclusively
            by regulated financial institutions through hard bureau inquiries and official
            underwriting.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Data Privacy & Security Hygiene
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            FinSmart AI enforces strict data minimisation protocols. We do not collect or store
            Government IDs, Social Security Numbers, banking credentials, or bank login tokens.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Records saved to the application are transmitted over HTTPS to backend endpoints. Google
            Sheets is utilized as an educational demonstration datastore; users are advised not to
            enter confidential proprietary data.
          </p>
        </div>
      </div>

      {/* Future Enhancements Roadmap (Requirement 22) */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
            Future Enhancement Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="font-bold text-cyan-300 block">User Authentication</span>
            <p className="text-slate-400">OAuth2.0 / Firebase Auth for individual user accounts.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="font-bold text-cyan-300 block">ML Loan Prediction Model</span>
            <p className="text-slate-400">Scikit-learn XGBoost model for approval probability.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="font-bold text-cyan-300 block">PDF Financial Reports</span>
            <p className="text-slate-400">Exportable comprehensive PDF dossiers with charts.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="font-bold text-indigo-300 block">Firebase / Cloud SQL Store</span>
            <p className="text-slate-400">Relational multi-tenant persistent storage.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="font-bold text-indigo-300 block">Loan Comparison Matrix</span>
            <p className="text-slate-400">Side-by-side multi-lender term analysis.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
            <span className="font-bold text-indigo-300 block">Multi-Language Localization</span>
            <p className="text-slate-400">International currency symbols & localized terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
