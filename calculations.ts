import {
  CreditAnalysisInput,
  CreditAnalysisResult,
  EmiInput,
  EmiResult,
  FactorAnalysis,
  LoanEligibilityInput,
  LoanEligibilityResult,
} from '../types';

/**
 * Standard EMI Calculation
 * Formula: EMI = P * R * (1 + R)^N / ((1 + R)^N - 1)
 */
export function calculateEmi(input: EmiInput): EmiResult {
  const P = Math.max(0, input.loanAmount);
  const annualRate = Math.max(0, input.interestRate);
  const totalMonths =
    input.tenureUnit === 'Years'
      ? Math.round(input.tenure * 12)
      : Math.round(input.tenure);

  if (P <= 0 || totalMonths <= 0) {
    return {
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayment: 0,
      principalAmount: P,
      interestPercentage: 0,
      principalPercentage: 100,
      amortizationPreview: [],
    };
  }

  // Handle zero-interest loans
  if (annualRate === 0) {
    const monthlyEmi = P / totalMonths;
    const totalPayment = P;
    const totalInterest = 0;
    return {
      monthlyEmi: Math.round(monthlyEmi * 100) / 100,
      totalInterest: 0,
      totalPayment: Math.round(totalPayment * 100) / 100,
      principalAmount: P,
      interestPercentage: 0,
      principalPercentage: 100,
      amortizationPreview: [
        {
          year: 1,
          principalPaid: P,
          interestPaid: 0,
          remainingBalance: 0,
        },
      ],
    };
  }

  const R = annualRate / 12 / 100;
  const numerator = P * R * Math.pow(1 + R, totalMonths);
  const denominator = Math.pow(1 + R, totalMonths) - 1;
  const monthlyEmi = numerator / denominator;
  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - P);

  const interestPercentage = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;
  const principalPercentage = totalPayment > 0 ? (P / totalPayment) * 100 : 100;

  // Generate Year-by-Year Amortization preview
  const amortizationPreview: EmiResult['amortizationPreview'] = [];
  let balance = P;
  const totalYears = Math.ceil(totalMonths / 12);

  for (let year = 1; year <= totalYears; year++) {
    const monthsInThisYear = Math.min(12, totalMonths - (year - 1) * 12);
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let m = 0; m < monthsInThisYear; m++) {
      const interestForMonth = balance * R;
      const principalForMonth = monthlyEmi - interestForMonth;
      yearlyInterest += interestForMonth;
      yearlyPrincipal += principalForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }

    amortizationPreview.push({
      year,
      principalPaid: Math.round(yearlyPrincipal),
      interestPaid: Math.round(yearlyInterest),
      remainingBalance: Math.round(balance),
    });
  }

  return {
    monthlyEmi: Math.round(monthlyEmi * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    principalAmount: P,
    interestPercentage: Math.round(interestPercentage * 10) / 10,
    principalPercentage: Math.round(principalPercentage * 10) / 10,
    amortizationPreview,
  };
}

/**
 * Estimated Loan Eligibility Algorithm
 */
export function evaluateLoanEligibility(input: LoanEligibilityInput): LoanEligibilityResult {
  const {
    age,
    monthlyIncome,
    employmentType,
    employmentExperience,
    existingEmi,
    desiredLoanAmount,
    desiredLoanTenureYears,
    creditScore,
  } = input;

  const factors: FactorAnalysis[] = [];

  // 1. Credit Tier Evaluation & Estimated Interest Rates
  let interestMin = 8.5;
  let interestMax = 11.5;
  let scorePoints = 0;

  if (creditScore >= 780) {
    interestMin = 7.5;
    interestMax = 9.2;
    scorePoints = 3;
    factors.push({
      name: 'Credit Profile',
      status: 'good',
      note: `Excellent score (${creditScore}) qualifies for premium institutional rates.`,
    });
  } else if (creditScore >= 720) {
    interestMin = 8.9;
    interestMax = 10.5;
    scorePoints = 2;
    factors.push({
      name: 'Credit Profile',
      status: 'good',
      note: `Strong score (${creditScore}) indicates consistent creditworthiness.`,
    });
  } else if (creditScore >= 650) {
    interestMin = 10.5;
    interestMax = 13.8;
    scorePoints = 1;
    factors.push({
      name: 'Credit Profile',
      status: 'warning',
      note: `Moderate score (${creditScore}) may incur higher risk premiums.`,
    });
  } else {
    interestMin = 14.0;
    interestMax = 18.5;
    scorePoints = -2;
    factors.push({
      name: 'Credit Profile',
      status: 'critical',
      note: `Sub-650 credit score indicates elevated underwriting friction.`,
    });
  }

  // 2. Allowable Fixed Obligation to Income Ratio (FOIR/DTI)
  // Higher income brackets can sustain higher DTI safely
  let allowableDtiLimit = 0.45;
  if (monthlyIncome > 10000) {
    allowableDtiLimit = 0.55;
  } else if (monthlyIncome < 3000) {
    allowableDtiLimit = 0.40;
  }

  // 3. Experience & Employment Assessment
  let employmentPoints = 0;
  if (employmentType === 'Salaried') {
    if (employmentExperience >= 2) {
      employmentPoints = 2;
      factors.push({
        name: 'Employment Stability',
        status: 'good',
        note: `Salaried role with ${employmentExperience} years seniority provides high repayment certainty.`,
      });
    } else {
      employmentPoints = 1;
      factors.push({
        name: 'Employment Stability',
        status: 'warning',
        note: `Salaried role with < 2 years experience; probationary verification may apply.`,
      });
    }
  } else if (employmentType === 'Business' || employmentType === 'Self-employed') {
    if (employmentExperience >= 3) {
      employmentPoints = 2;
      factors.push({
        name: 'Business Track Record',
        status: 'good',
        note: `Established self-employed business with ${employmentExperience} years operational history.`,
      });
    } else {
      employmentPoints = 0;
      factors.push({
        name: 'Business Track Record',
        status: 'warning',
        note: `Less than 3 years in business; lenders often request audited tax audits or collateral.`,
      });
    }
  } else {
    employmentPoints = -1;
    factors.push({
      name: 'Income Continuity',
      status: 'warning',
      note: `Non-traditional employment classification requires supplementary proof of cash flow.`,
    });
  }

  // 4. Age Assessment (Retirement runway)
  const maxRepaymentAge = 65;
  const estimatedEndAge = age + desiredLoanTenureYears;
  let agePoints = 0;

  if (age >= 21 && estimatedEndAge <= maxRepaymentAge) {
    agePoints = 1;
    factors.push({
      name: 'Age & Loan Tenure Window',
      status: 'good',
      note: `Candidate (age ${age}) will complete payments by age ${estimatedEndAge}, comfortably prior to typical retirement.`,
    });
  } else if (estimatedEndAge > maxRepaymentAge) {
    agePoints = -1;
    factors.push({
      name: 'Age & Loan Tenure Window',
      status: 'warning',
      note: `Requested tenure finishes at age ${estimatedEndAge}, surpassing traditional working years. Consider shortening tenure.`,
    });
  } else {
    agePoints = -2;
    factors.push({
      name: 'Age Requirement',
      status: 'critical',
      note: `Age ${age} falls outside the standard 21-65 lending corridor.`,
    });
  }

  // 5. Financial Capacities and Debt Calculations
  const midInterest = (interestMin + interestMax) / 2;
  const requestedTenureMonths = desiredLoanTenureYears * 12;

  // New EMI for requested loan
  const emiCalc = calculateEmi({
    loanAmount: desiredLoanAmount,
    interestRate: midInterest,
    tenure: requestedTenureMonths,
    tenureUnit: 'Months',
  });
  const estimatedNewEmi = emiCalc.monthlyEmi;

  const totalMonthlyObligation = existingEmi + estimatedNewEmi;
  const dti = monthlyIncome > 0 ? (totalMonthlyObligation / monthlyIncome) * 100 : 100;

  // DTI factor
  if (dti <= 40) {
    factors.push({
      name: 'Debt-to-Income (DTI)',
      status: 'good',
      note: `Estimated overall DTI of ${dti.toFixed(1)}% is well below the standard 45% ceiling.`,
    });
  } else if (dti <= allowableDtiLimit * 100) {
    factors.push({
      name: 'Debt-to-Income (DTI)',
      status: 'warning',
      note: `Estimated DTI is ${dti.toFixed(1)}%, approaching the institutional tolerance band.`,
    });
  } else {
    factors.push({
      name: 'Debt-to-Income (DTI)',
      status: 'critical',
      note: `Combined monthly commitments (${dti.toFixed(1)}% of income) exceed safe debt capacity guidelines.`,
    });
  }

  // 6. Max Estimated Loan Capacity Calculation (Present Value of Max Allowable EMI)
  const maxAllowedTotalEmi = monthlyIncome * allowableDtiLimit;
  const maxAvailableEmiForNewLoan = Math.max(0, maxAllowedTotalEmi - existingEmi);

  let maxEstimatedLoan = 0;
  if (maxAvailableEmiForNewLoan > 0 && midInterest > 0) {
    const r = midInterest / 12 / 100;
    const n = requestedTenureMonths;
    // PV = EMI * ( (1+r)^n - 1 ) / ( r * (1+r)^n )
    const pv = (maxAvailableEmiForNewLoan * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    maxEstimatedLoan = Math.max(0, Math.round(pv / 1000) * 1000); // rounded to nearest 1,000
  }

  // 7. Determine Final Status & Risk Category
  let status: LoanEligibilityResult['status'] = 'Eligible';
  let riskCategory: LoanEligibilityResult['riskCategory'] = 'Low';

  const totalScore = scorePoints + employmentPoints + agePoints;

  if (dti <= 42 && creditScore >= 700 && totalScore >= 2 && desiredLoanAmount <= maxEstimatedLoan) {
    status = 'Eligible';
    riskCategory = creditScore >= 760 ? 'Low' : 'Moderate';
  } else if (dti <= allowableDtiLimit * 100 + 5 && creditScore >= 630 && maxAvailableEmiForNewLoan > 100) {
    status = 'Potentially Eligible';
    riskCategory = 'Moderate';
  } else {
    status = 'Requires Review';
    riskCategory = 'High';
  }

  // Specific overrides
  if (creditScore < 600 || dti > 65 || age < 21 || age > 65) {
    status = 'Requires Review';
    riskCategory = 'High';
  }

  let breakdownSummary = '';
  if (status === 'Eligible') {
    breakdownSummary = `Your financial fundamentals are strong. Your debt-to-income ratio (${dti.toFixed(1)}%) leaves ample surplus, and your credit score (${creditScore}) positions you for favorable loan terms.`;
  } else if (status === 'Potentially Eligible') {
    breakdownSummary = `You demonstrate viable repayment capability, but your loan-to-income or credit band suggests lenders may ask for higher down payments, proof of collateral, or a co-signer.`;
  } else {
    breakdownSummary = `The requested loan creates a high obligation ratio (${dti.toFixed(1)}% DTI) or your credit profile requires remediation before institutional approval is probable.`;
  }

  return {
    status,
    maxEstimatedLoan,
    estimatedInterestRateMin: interestMin,
    estimatedInterestRateMax: interestMax,
    riskCategory,
    debtToIncomeRatio: Math.round(dti * 10) / 10,
    estimatedNewEmi: Math.round(estimatedNewEmi),
    totalMonthlyObligation: Math.round(totalMonthlyObligation),
    breakdownSummary,
    factors,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Credit Profile Evaluation
 */
export function analyzeCreditScore(input: CreditAnalysisInput): CreditAnalysisResult {
  const { creditScore, monthlyIncome, existingEmi, activeLoansCount, creditUtilization, paymentHistory } = input;

  let scoreCategory: CreditAnalysisResult['scoreCategory'] = 'Fair';
  let scoreRange = '620 - 699';
  let riskLevel: CreditAnalysisResult['riskLevel'] = 'Moderate';

  if (creditScore >= 780) {
    scoreCategory = 'Excellent';
    scoreRange = '780 - 850';
    riskLevel = 'Low';
  } else if (creditScore >= 700) {
    scoreCategory = 'Good';
    scoreRange = '700 - 779';
    riskLevel = 'Low';
  } else if (creditScore >= 620) {
    scoreCategory = 'Fair';
    scoreRange = '620 - 699';
    riskLevel = 'Moderate';
  } else {
    scoreCategory = 'Needs Improvement';
    scoreRange = '300 - 619';
    riskLevel = 'High';
  }

  const dti = monthlyIncome > 0 ? (existingEmi / monthlyIncome) * 100 : 0;

  let utilizationHealth: CreditAnalysisResult['utilizationHealth'] = 'Optimal (<30%)';
  if (creditUtilization > 50) {
    utilizationHealth = 'High Risk (>50%)';
  } else if (creditUtilization >= 30) {
    utilizationHealth = 'Elevated (30-50%)';
  }

  const positiveFactors: string[] = [];
  const riskFactors: string[] = [];
  const suggestedActions: string[] = [];

  // Positive factors
  if (creditScore >= 720) {
    positiveFactors.push(`Strong credit metric placement in the ${scoreCategory} bracket.`);
  }
  if (paymentHistory === 'always_on_time') {
    positiveFactors.push('Flawless on-time payment track record across existing obligations.');
  }
  if (creditUtilization < 30) {
    positiveFactors.push(`Low revolving credit balance utilization (${creditUtilization}%), signaling responsible liquidity.`);
  }
  if (dti <= 35) {
    positiveFactors.push(`Manageable debt-to-income footprint (${dti.toFixed(1)}%).`);
  }
  if (activeLoansCount <= 2 && activeLoansCount > 0) {
    positiveFactors.push(`Controlled credit diversification with ${activeLoansCount} active credit line(s).`);
  }

  // Risk factors
  if (creditUtilization >= 30) {
    riskFactors.push(`Revolving utilization at ${creditUtilization}% exceeds the recommended 30% threshold.`);
  }
  if (paymentHistory === 'frequent_delays') {
    riskFactors.push('History of repeated late payments heavily suppresses bureau score algorithms.');
  } else if (paymentHistory === 'minor_delays') {
    riskFactors.push('Occasional late payment records reduce lender confidence in automated scoring.');
  }
  if (activeLoansCount > 4) {
    riskFactors.push(`High simultaneous loan volume (${activeLoansCount} accounts) flags potential credit hunger.`);
  }
  if (dti > 45) {
    riskFactors.push(`Existing debt consumes ${dti.toFixed(1)}% of your gross monthly cash flow.`);
  }
  if (creditScore < 650) {
    riskFactors.push('Credit score falls into non-prime underwriting tier with increased denial risk.');
  }

  // Suggested Actions
  if (creditUtilization > 30) {
    suggestedActions.push(`Pay down high-balance credit cards to reduce total revolving utilization below 30%.`);
  }
  if (paymentHistory !== 'always_on_time') {
    suggestedActions.push(`Set up automated auto-pay for minimum dues to build an unbroken 6-month on-time payment streak.`);
  }
  if (activeLoansCount > 3) {
    suggestedActions.push(`Consider a debt consolidation loan to merge multiple smaller obligations into a single manageable rate.`);
  }
  suggestedActions.push(`Obtain an annual credit report from authorized bureaus to check for inaccuracies or outdated delinquent markers.`);
  suggestedActions.push(`Refrain from opening multiple new credit inquiries or credit card applications within a 6-month timeframe.`);

  if (positiveFactors.length === 0) {
    positiveFactors.push('Active credit history allows room for steady tactical improvement over time.');
  }

  return {
    scoreCategory,
    scoreRange,
    riskLevel,
    dti: Math.round(dti * 10) / 10,
    positiveFactors,
    riskFactors,
    suggestedActions,
    utilizationHealth,
  };
}

/**
 * Currency and Number Formatters
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  if (isNaN(amount)) return `${currency}0`;
  return `${currency}${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}
