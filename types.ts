export type EmploymentType = 'Salaried' | 'Self-employed' | 'Business' | 'Other';

export interface LoanEligibilityInput {
  fullName: string;
  age: number;
  monthlyIncome: number;
  employmentType: EmploymentType;
  employmentExperience: number;
  existingEmi: number;
  desiredLoanAmount: number;
  desiredLoanTenureYears: number;
  creditScore: number;
}

export interface FactorAnalysis {
  name: string;
  status: 'good' | 'warning' | 'critical';
  note: string;
}

export interface LoanEligibilityResult {
  status: 'Eligible' | 'Potentially Eligible' | 'Requires Review';
  maxEstimatedLoan: number;
  estimatedInterestRateMin: number;
  estimatedInterestRateMax: number;
  riskCategory: 'Low' | 'Moderate' | 'High';
  debtToIncomeRatio: number;
  estimatedNewEmi: number;
  totalMonthlyObligation: number;
  breakdownSummary: string;
  factors: FactorAnalysis[];
  timestamp: string;
}

export type TenureUnit = 'Months' | 'Years';

export interface EmiInput {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  tenureUnit: TenureUnit;
}

export interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  principalAmount: number;
  interestPercentage: number;
  principalPercentage: number;
  amortizationPreview: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[];
}

export type PaymentHistoryType = 'always_on_time' | 'minor_delays' | 'frequent_delays';

export interface CreditAnalysisInput {
  creditScore: number;
  monthlyIncome: number;
  existingEmi: number;
  activeLoansCount: number;
  creditUtilization: number;
  paymentHistory: PaymentHistoryType;
}

export interface CreditAnalysisResult {
  scoreCategory: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
  scoreRange: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  dti: number;
  positiveFactors: string[];
  riskFactors: string[];
  suggestedActions: string[];
  utilizationHealth: 'Optimal (<30%)' | 'Elevated (30-50%)' | 'High Risk (>50%)';
}

export interface FinancialAdviceRequest {
  goal: string;
  monthlyIncome?: number;
  creditScore?: number;
  existingEmi?: number;
  requestedLoan?: number;
  extraContext?: string;
}

export interface FinancialAdviceResponse {
  summary: string;
  personalizedTips: string[];
  loanRepaymentSuggestions: string[];
  budgetingSuggestions: string[];
  emiManagementTips: string[];
  creditImprovementSuggestions: string[];
  savingsGuidance: string[];
  riskWarnings: string[];
  actionSteps: { step: number; title: string; description: string }[];
  assumptions: string[];
  provider: string;
  disclaimer: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  userName: string;
  age?: number;
  income: number;
  employmentType: string;
  creditScore: number;
  loanAmount: number;
  loanTenureMonths: number;
  emi: number;
  eligibilityResult: string;
  riskCategory: string;
  source: string;
  syncedToSheets?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  type: 'loan' | 'emi' | 'credit' | 'ai' | 'record';
}

export interface DashboardStats {
  totalLoanChecks: number;
  totalEmiCalculations: number;
  averageCreditScore: number;
  totalRecords: number;
  recentActivity: ActivityItem[];
}
