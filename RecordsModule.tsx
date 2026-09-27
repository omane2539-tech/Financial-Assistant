import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Info,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { FinancialRecord } from '../types';
import { formatCurrency } from '../utils/calculations';

interface RecordsModuleProps {
  records: FinancialRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteRecord: (id: string) => Promise<void>;
  googleSheetsConnected: boolean;
}

export const RecordsModule: React.FC<RecordsModuleProps> = ({
  records,
  isLoading,
  onRefresh,
  onDeleteRecord,
  googleSheetsConnected,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'loan_desc' | 'score_desc'>('date_desc');
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        const matchesSearch =
          rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.employmentType.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'ALL' || rec.eligibilityResult === statusFilter;

        const matchesRisk =
          riskFilter === 'ALL' || rec.riskCategory === riskFilter;

        return matchesSearch && matchesStatus && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'loan_desc') return b.loanAmount - a.loanAmount;
        if (sortBy === 'score_desc') return b.creditScore - a.creditScore;
        return 0;
      });
  }, [records, searchTerm, statusFilter, riskFilter, sortBy]);

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'Record ID',
      'Date',
      'Applicant Name',
      'Age',
      'Monthly Income',
      'Employment Type',
      'Credit Score',
      'Loan Amount',
      'Tenure (Months)',
      'Monthly EMI',
      'Eligibility Result',
      'Risk Category',
      'Source Module',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      r.date,
      `"${r.userName}"`,
      r.age || 'N/A',
      r.income,
      r.employmentType,
      r.creditScore,
      r.loanAmount,
      r.loanTenureMonths,
      r.emi,
      r.eligibilityResult,
      r.riskCategory,
      r.source,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinSmart_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-500/15 p-2 border border-amber-500/30 text-amber-400">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Financial Records Ledger</h1>
            <p className="text-xs text-slate-400">
              Historical calculations & simulations • Google Sheets synchronization layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Google Sheets Status & Architecture Notice */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/15 p-2 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Google Sheets Integration Layer</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                  googleSheetsConnected
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                }`}
              >
                {googleSheetsConnected ? 'Sheets Sync Enabled' : 'Local & API Mock Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
              Records are securely managed via server-side API endpoints (`/api/records`). When{' '}
              <code className="text-cyan-300">GOOGLE_SHEETS_ID</code> and service-account credentials
              are configured in environment variables, records mirror directly into your spreadsheet.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-white/5 shrink-0 max-w-xs">
          <span className="font-semibold text-slate-300 block mb-0.5">Storage Notice:</span>
          Google Sheets is designated as an accessible demonstration storage layer, not a high-compliance banking vault. No passwords or SSNs are recorded.
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by applicant name, ID, or job title..."
            className="glass-input w-full rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs text-white bg-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="Eligible">Eligible</option>
            <option value="Potentially Eligible">Potentially Eligible</option>
            <option value="Requires Review">Requires Review</option>
            <option value="Calculated">Calculated</option>
          </select>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-xs text-white bg-slate-900"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="High">High Risk</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="glass-input rounded-xl px-3 py-2 text-xs text-white bg-slate-900"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="loan_desc">Highest Loan</option>
            <option value="score_desc">Highest Credit</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Date & ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Income</th>
                <th className="py-3 px-4">Credit Score</th>
                <th className="py-3 px-4">Loan Amount</th>
                <th className="py-3 px-4">EMI</th>
                <th className="py-3 px-4">Eligibility</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No financial records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{rec.date}</div>
                      <span className="text-[10px] text-slate-400">{rec.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{rec.userName}</div>
                      <span className="text-[11px] text-slate-400">{rec.employmentType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {formatCurrency(rec.income)}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          rec.creditScore >= 740
                            ? 'text-emerald-400'
                            : rec.creditScore >= 670
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {rec.creditScore}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      {formatCurrency(rec.loanAmount)}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {rec.loanTenureMonths} Mo tenure
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {formatCurrency(rec.emi)}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          rec.eligibilityResult === 'Eligible'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : rec.eligibilityResult === 'Potentially Eligible'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : rec.eligibilityResult === 'Calculated'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rec.eligibilityResult}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold text-xs ${
                          rec.riskCategory === 'Low'
                            ? 'text-emerald-400'
                            : rec.riskCategory === 'Moderate'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {rec.riskCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(rec)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards Layout */}
      <div className="block md:hidden space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-8 text-center text-xs text-slate-400">
            No records found.
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{rec.userName}</h3>
                  <span className="text-[11px] text-slate-400">
                    {rec.id} • {rec.date}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    rec.eligibilityResult === 'Eligible'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : rec.eligibilityResult === 'Potentially Eligible'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {rec.eligibilityResult}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-white/5">
                <div>
                  <span className="text-[11px] text-slate-400">Loan Amount:</span>
                  <p className="font-bold text-slate-200">{formatCurrency(rec.loanAmount)}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Monthly EMI:</span>
                  <p className="font-bold text-cyan-300">{formatCurrency(rec.emi)}/mo</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Credit Score:</span>
                  <p className="font-bold text-slate-200">{rec.creditScore}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400">Risk Level:</span>
                  <p className="font-bold text-amber-400">{rec.riskCategory}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400">{rec.source}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(rec)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    className="text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  Record Details: {selectedRecord.id}
                </h3>
                <span className="text-xs text-slate-400">Logged on {selectedRecord.date}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400">Applicant:</span>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedRecord.userName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Employment:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{selectedRecord.employmentType}</p>
                </div>
                <div>
                  <span className="text-slate-400">Gross Monthly Income:</span>
                  <p className="font-bold text-slate-200 mt-0.5">{formatCurrency(selectedRecord.income)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Credit Score:</span>
                  <p className="font-bold text-cyan-300 mt-0.5">{selectedRecord.creditScore}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400">Loan Amount:</span>
                  <p className="font-bold text-white text-sm mt-0.5">
                    {formatCurrency(selectedRecord.loanAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Tenure:</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {selectedRecord.loanTenureMonths} Months ({Math.round(selectedRecord.loanTenureMonths / 12)} Yrs)
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Monthly EMI:</span>
                  <p className="font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(selectedRecord.emi)}/mo
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Eligibility & Risk:</span>
                  <p className="font-bold text-slate-200 mt-0.5">
                    {selectedRecord.eligibilityResult} ({selectedRecord.riskCategory} Risk)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Source & Sync Status:</span>
                Module: {selectedRecord.source} • Synced to Google Sheets:{' '}
                {selectedRecord.syncedToSheets ? 'Yes' : 'Local Archive'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
