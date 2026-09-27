export interface AdvisoryParams {
  goal: string;
  income: number;
  score: number;
  emi: number;
  loan: number;
  dti: number;
}

export function generateDeterministicAdvice(params: AdvisoryParams) {
  const { goal, income, score, emi, loan, dti } = params;
  const cleanGoal = goal || 'Financial Health & Stability';
  const isCar = /car|vehicle|auto/i.test(cleanGoal);
  const isHouse = /house|home|mortgage|property/i.test(cleanGoal);
  const isEmi = /reduce|emi|debt|loan/i.test(cleanGoal);

  let topicSummary = `Comprehensive assessment for "${cleanGoal}". With a gross monthly income of $${income.toLocaleString()} and existing obligations of $${emi.toLocaleString()} (${dti.toFixed(1)}% DTI), your financial foundation provides specific leverage points.`;

  if (isCar) {
    topicSummary = `Vehicle Purchase Feasibility: Evaluating target loan of $${loan.toLocaleString()} against your $${income.toLocaleString()} monthly cashflow and ${score} credit profile.`;
  } else if (isHouse) {
    topicSummary = `Mortgage Readiness: Evaluating real estate capability for target financing of $${loan.toLocaleString()} with existing monthly obligations of $${emi.toLocaleString()}.`;
  } else if (isEmi) {
    topicSummary = `Debt Compression Strategy: Structured blueprint to accelerate payoff of existing monthly EMIs totaling $${emi.toLocaleString()} and minimize cumulative interest drag.`;
  }

  return {
    summary: topicSummary,
    personalizedTips: [
      `Maintain a strict 50/30/20 budget framework: Allocate up to $${Math.round(income * 0.5).toLocaleString()} for essential needs, $${Math.round(income * 0.3).toLocaleString()} for discretionary spending, and at least $${Math.round(income * 0.2).toLocaleString()} to savings or debt reduction.`,
      `Protect your Debt-to-Income (DTI) ratio below 40%. Your current baseline DTI sits at ${dti.toFixed(1)}%, which leaves ${dti < 40 ? 'comfortable headroom for structured debt service' : 'tight margins requiring debt rationalization before new commitments'}.`,
      `Leverage your ${score >= 740 ? 'premium' : score >= 670 ? 'favorable' : 'developing'} credit tier (${score}) to negotiate competitive annual percentage rates (APRs) from top-tier institutional lenders.`,
    ],
    loanRepaymentSuggestions: [
      'Implement the Bi-Weekly Payment Method: Splitting monthly EMI into half every two weeks results in 26 half-payments (13 full monthly payments per year), reducing amortized interest by 15-22%.',
      'Apply an annual lump-sum prepayment equivalent to 1 extra monthly installment whenever receiving bonuses or tax refunds to knock off up to 2 years of tenure.',
      'Always confirm with your servicer that supplementary payments are allocated directly to Principal Reduction rather than future escrow or unearned interest.',
    ],
    budgetingSuggestions: [
      `Target a minimum liquid emergency fund of $${Math.round(income * 3).toLocaleString()} to $${Math.round(income * 6).toLocaleString()} in a high-yield savings account prior to taking on new long-term liabilities.`,
      'Conduct a 30-day subscription and non-essential expense audit to free up 3% to 6% of monthly discretionary income directly into high-interest debt payoffs.',
      'Utilize envelope or dedicated sub-account budgeting to partition fixed recurring obligations from variable dining and retail expenses.',
    ],
    emiManagementTips: [
      dti > 45
        ? 'High DTI Warning: Prioritize retiring small high-APR credit balances first (Debt Snowball) to immediately extinguish monthly minimum payment strain.'
        : 'Optimize your EMI schedule by aligning debit dates within 48 hours of primary payroll deposits to avoid overdraft fees and interest slippage.',
      'Consider exploring balance transfers or refinancing if your current loan interest rate exceeds 11% and your credit score remains above 700.',
    ],
    creditImprovementSuggestions: [
      'Maintain credit card utilization strictly under 30% on each individual card and across total aggregate credit lines (under 10% is ideal for maximizing bureau models).',
      'Avoid opening more than two new credit inquiries in a rolling 12-month window to prevent temporary credit score suppression.',
      'Keep your oldest credit card accounts open with nominal recurring charges to lengthen the average credit history duration metric.',
    ],
    savingsGuidance: [
      `Automate a direct deposit of $${Math.round(income * 0.15).toLocaleString()} per month into a capital preservation instrument before accessing discretionary funds.`,
      'Match savings horizons to vehicle type: 1-2 year goals in High-Yield Savings/Certificates of Deposit; 5+ year horizons in low-cost diversified index funds.',
    ],
    riskWarnings: [
      'Avoid balloon-payment or variable-rate loans during uncertain macroeconomic interest rate cycles.',
      `Never exceed a combined DTI of 50% ($${Math.round(income * 0.5).toLocaleString()}/month total debt load), as it severely restricts your ability to navigate medical or employment shocks.`,
    ],
    actionSteps: [
      {
        step: 1,
        title: 'Conduct Debt & Cashflow Baseline Audit',
        description: `Map out all active commitments against your $${income.toLocaleString()} monthly income to verify your actual net surplus after expenses.`,
      },
      {
        step: 2,
        title: 'Lock In an Emergency Reserve Buffer',
        description: `Ensure you have at least 3 months of essential expenses ($${Math.round(income * 0.6 * 3).toLocaleString()}) isolated from investment volatility.`,
      },
      {
        step: 3,
        title: 'Compare Multi-Lender APR Terms',
        description:
          'Obtain soft pre-approval quotes from at least 3 distinct institutions (credit unions, regional banks, and online lenders) within a 14-day shopping window.',
      },
      {
        step: 4,
        title: 'Execute Automated Repayment Rule',
        description:
          'Set up automatic bill-pay for loan installments and schedule quarterly reviews to evaluate prepayment acceleration.',
      },
    ],
    assumptions: [
      `Assumed gross monthly household income remains stable at $${income.toLocaleString()}.`,
      `Evaluated with credit tier benchmark (${score} FICO/Vantage score equivalent).`,
      `Assumed standard fixed-rate amortized loan structures without prepayment penalties.`,
    ],
    provider: 'FinSmart Financial Intelligence Engine',
  };
}
