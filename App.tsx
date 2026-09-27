import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DashboardStats } from './components/DashboardStats';
import { LoanEligibilityModule } from './components/LoanEligibilityModule';
import { EmiCalculatorModule } from './components/EmiCalculatorModule';
import { CreditScoreAnalyzerModule } from './components/CreditScoreAnalyzerModule';
import { AiFinancialTipsModule } from './components/AiFinancialTipsModule';
import { RecordsModule } from './components/RecordsModule';
import { AboutModule } from './components/AboutModule';
import { DashboardStats as IDashboardStats, FinancialRecord } from './types';
import { Sparkles, Shield, Heart } from 'lucide-react';

const DEFAULT_RECORDS: FinancialRecord[] = [
  {
    id: 'REC-10482',
    date: '2026-09-20',
    userName: 'Elena Rostova',
    age: 32,
    income: 8500,
    employmentType: 'Salaried',
    creditScore: 785,
    loanAmount: 250000,
    loanTenureMonths: 240,
    emi: 1980,
    eligibilityResult: 'Eligible',
    riskCategory: 'Low',
    source: 'Loan Eligibility',
    syncedToSheets: false,
  },
  {
    id: 'REC-10481',
    date: '2026-09-19',
    userName: 'David Chen',
    age: 41,
    income: 12000,
    employmentType: 'Business',
    creditScore: 710,
    loanAmount: 120000,
    loanTenureMonths: 60,
    emi: 2435,
    eligibilityResult: 'Eligible',
    riskCategory: 'Low',
    source: 'Loan Eligibility',
    syncedToSheets: false,
  },
  {
    id: 'REC-10479',
    date: '2026-09-18',
    userName: 'Sarah Jenkins',
    age: 27,
    income: 4200,
    employmentType: 'Salaried',
    creditScore: 660,
    loanAmount: 35000,
    loanTenureMonths: 48,
    emi: 895,
    eligibilityResult: 'Potentially Eligible',
    riskCategory: 'Moderate',
    source: 'Loan Eligibility',
    syncedToSheets: false,
  },
  {
    id: 'REC-10475',
    date: '2026-09-16',
    userName: 'Rajesh Patel',
    age: 36,
    income: 6800,
    employmentType: 'Self-employed',
    creditScore: 615,
    loanAmount: 85000,
    loanTenureMonths: 84,
    emi: 1540,
    eligibilityResult: 'Requires Review',
    riskCategory: 'High',
    source: 'Loan Eligibility',
    syncedToSheets: false,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<IDashboardStats>({
    totalLoanChecks: 14,
    totalEmiCalculations: 38,
    averageCreditScore: 728,
    totalRecords: 4,
    recentActivity: [
      {
        id: 'act-1',
        title: 'Loan Eligibility Check',
        detail: 'Marcus Vance checked eligibility for $45,000 auto loan (Eligible, 740 score).',
        timestamp: '10 mins ago',
        type: 'loan',
      },
      {
        id: 'act-2',
        title: 'EMI Calculation',
        detail: 'Calculated monthly installment for $350,000 home mortgage @ 6.8%.',
        timestamp: '25 mins ago',
        type: 'emi',
      },
      {
        id: 'act-3',
        title: 'Credit Score Analysis',
        detail: 'Profile diagnostic completed for 685 score with recommendations.',
        timestamp: '1 hour ago',
        type: 'credit',
      },
      {
        id: 'act-4',
        title: 'AI Financial Guidance',
        detail: 'Generated financial plan with FinSmart AI Advisor.',
        timestamp: '2 hours ago',
        type: 'ai',
      },
    ],
  });
  const [records, setRecords] = useState<FinancialRecord[]>(DEFAULT_RECORDS);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [googleSheetsConnected, setGoogleSheetsConnected] = useState(false);
  const [apiHealth, setApiHealth] = useState<{
    anthropicConfigured: boolean;
    geminiConfigured: boolean;
    googleSheetsConfigured: boolean;
  }>({
    anthropicConfigured: false,
    geminiConfigured: false,
    googleSheetsConfigured: false,
  });

  // Cross-module prefill states
  const [emiPrefill, setEmiPrefill] = useState<{
    amount: number;
    rate: number;
    tenureYears: number;
  } | null>(null);

  const [aiPrefill, setAiPrefill] = useState<{
    goal?: string;
    income?: number;
    score?: number;
    emi?: number;
    loan?: number;
    extraContext?: string;
  } | null>(null);

  // Fetch stats and records on mount
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Could not fetch stats:', e);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
        setGoogleSheetsConnected(Boolean(data.googleSheetsConnected));
        return;
      }
    } catch (e) {
      console.warn('Could not fetch records from server, checking local storage:', e);
    } finally {
      setIsLoadingRecords(false);
    }

    try {
      const saved = localStorage.getItem('finsmart_records');
      if (saved) {
        setRecords(JSON.parse(saved));
      } else {
        setRecords(DEFAULT_RECORDS);
      }
    } catch {
      setRecords(DEFAULT_RECORDS);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setApiHealth(data.features || {});
      }
    } catch (e) {
      console.warn('Could not fetch health:', e);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecords();
    fetchHealth();
  }, [fetchStats, fetchRecords, fetchHealth]);

  // Save record handler
  const handleSaveRecord = async (recordData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setRecords((prev) => [data.record, ...prev]);
        }
        fetchStats();
        return true;
      }
    } catch (e) {
      console.warn('Server save record failed, saving to local storage:', e);
    }

    // Local storage fallback
    const newRecord: FinancialRecord = {
      ...recordData,
      id: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      syncedToSheets: false,
    };
    setRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('finsmart_records', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setStats((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
    return true;
  };

  // Delete record handler
  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        fetchStats();
        return;
      }
    } catch (e) {
      console.warn('Server delete record failed, updating local storage:', e);
    }

    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('finsmart_records', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setStats((prev) => ({
      ...prev,
      totalRecords: Math.max(0, prev.totalRecords - 1),
    }));
  };

  // Track action handler
  const handleTrackAction = async (type: string, meta?: any) => {
    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, meta }),
      });
      fetchStats();
    } catch (e) {
      // Local stat tracking fallback
      setStats((prev) => {
        if (type === 'loan') return { ...prev, totalLoanChecks: prev.totalLoanChecks + 1 };
        if (type === 'emi') return { ...prev, totalEmiCalculations: prev.totalEmiCalculations + 1 };
        return prev;
      });
    }
  };

  // Cross-module routing actions
  const handleConsultAi = (context: {
    goal: string;
    income?: number;
    score?: number;
    emi?: number;
    loan?: number;
    extraContext?: string;
  }) => {
    setAiPrefill(context);
    setActiveTab('ai-tips');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEmi = (params: { amount: number; rate: number; tenureYears: number }) => {
    setEmiPrefill(params);
    setActiveTab('emi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiHealth={apiHealth}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <HeroSection
              onCheckLoan={() => {
                setActiveTab('loan');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onCalculateEmi={() => {
                setActiveTab('emi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onConsultAi={() => {
                setActiveTab('ai-tips');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
              <DashboardStats
                stats={stats}
                onNavigate={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          {activeTab === 'loan' && (
            <LoanEligibilityModule
              onSaveRecord={handleSaveRecord}
              onConsultAi={handleConsultAi}
              onOpenEmi={handleOpenEmi}
              onTrackAction={handleTrackAction}
            />
          )}

          {activeTab === 'emi' && (
            <EmiCalculatorModule
              initialValues={emiPrefill}
              onSaveRecord={handleSaveRecord}
              onConsultAi={handleConsultAi}
              onTrackAction={handleTrackAction}
            />
          )}

          {activeTab === 'credit' && (
            <CreditScoreAnalyzerModule
              onSaveRecord={handleSaveRecord}
              onConsultAi={handleConsultAi}
              onTrackAction={handleTrackAction}
            />
          )}

          {activeTab === 'ai-tips' && (
            <AiFinancialTipsModule
              initialContext={aiPrefill}
              onTrackAction={handleTrackAction}
            />
          )}

          {activeTab === 'records' && (
            <RecordsModule
              records={records}
              isLoading={isLoadingRecords}
              onRefresh={fetchRecords}
              onDeleteRecord={handleDeleteRecord}
              googleSheetsConnected={googleSheetsConnected}
            />
          )}

          {activeTab === 'about' && <AboutModule />}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#060a14] py-8 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white tracking-tight">
              FinSmart<span className="text-cyan-400">.AI</span>
            </span>
            <span>— Educational Financial Assistant</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Architecture & Disclaimer
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('records');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-300 transition-colors"
            >
              Sheets Storage
            </button>
            <span>•</span>
            <span className="text-slate-500">HTTPS Enforced</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
