export interface ValidationErrors {
  [key: string]: string;
}

export function validateLoanForm(values: {
  fullName: string;
  age: number | string;
  monthlyIncome: number | string;
  employmentType: string;
  employmentExperience: number | string;
  existingEmi: number | string;
  desiredLoanAmount: number | string;
  desiredLoanTenureYears: number | string;
  creditScore: number | string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  // Full Name
  if (!values.fullName || values.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full legal name (minimum 2 characters).';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(values.fullName.trim())) {
    errors.fullName = 'Full name should only contain letters and standard punctuation.';
  }

  // Age
  const ageNum = Number(values.age);
  if (values.age === '' || isNaN(ageNum)) {
    errors.age = 'Age is required.';
  } else if (!Number.isInteger(ageNum)) {
    errors.age = 'Age must be a whole number.';
  } else if (ageNum < 18) {
    errors.age = 'Applicant must be at least 18 years of age.';
  } else if (ageNum > 80) {
    errors.age = 'Maximum allowable applicant age for calculation is 80 years.';
  }

  // Monthly Income
  const incomeNum = Number(values.monthlyIncome);
  if (values.monthlyIncome === '' || isNaN(incomeNum)) {
    errors.monthlyIncome = 'Monthly income is required.';
  } else if (incomeNum <= 0) {
    errors.monthlyIncome = 'Monthly income must be a positive number greater than 0.';
  } else if (incomeNum > 10000000) {
    errors.monthlyIncome = 'Please enter a realistic monthly income value.';
  }

  // Employment Type
  if (!values.employmentType) {
    errors.employmentType = 'Please select your employment classification.';
  }

  // Employment Experience
  const expNum = Number(values.employmentExperience);
  if (values.employmentExperience === '' || isNaN(expNum)) {
    errors.employmentExperience = 'Experience is required.';
  } else if (expNum < 0) {
    errors.employmentExperience = 'Employment experience cannot be negative.';
  } else if (expNum > 60) {
    errors.employmentExperience = 'Please enter experience between 0 and 60 years.';
  }

  // Existing EMI
  const emiNum = Number(values.existingEmi);
  if (values.existingEmi === '' || isNaN(emiNum)) {
    errors.existingEmi = 'Existing EMI is required (enter 0 if none).';
  } else if (emiNum < 0) {
    errors.existingEmi = 'Existing EMI cannot be negative.';
  } else if (emiNum > incomeNum && incomeNum > 0) {
    errors.existingEmi = 'Existing EMI exceeds gross monthly income.';
  }

  // Desired Loan Amount
  const loanNum = Number(values.desiredLoanAmount);
  if (values.desiredLoanAmount === '' || isNaN(loanNum)) {
    errors.desiredLoanAmount = 'Desired loan amount is required.';
  } else if (loanNum <= 0) {
    errors.desiredLoanAmount = 'Loan amount must be greater than zero.';
  } else if (loanNum < 500) {
    errors.desiredLoanAmount = 'Minimum loan evaluation amount is $500.';
  } else if (loanNum > 50000000) {
    errors.desiredLoanAmount = 'Please enter an amount under $50,000,000.';
  }

  // Desired Loan Tenure
  const tenureNum = Number(values.desiredLoanTenureYears);
  if (values.desiredLoanTenureYears === '' || isNaN(tenureNum)) {
    errors.desiredLoanTenureYears = 'Loan tenure is required.';
  } else if (tenureNum <= 0) {
    errors.desiredLoanTenureYears = 'Tenure must be greater than zero.';
  } else if (tenureNum > 40) {
    errors.desiredLoanTenureYears = 'Maximum allowable tenure is 40 years.';
  }

  // Credit Score
  const creditNum = Number(values.creditScore);
  if (values.creditScore === '' || isNaN(creditNum)) {
    errors.creditScore = 'Credit score is required.';
  } else if (!Number.isInteger(creditNum)) {
    errors.creditScore = 'Credit score must be a whole integer.';
  } else if (creditNum < 300 || creditNum > 850) {
    errors.creditScore = 'Credit score must be within the standard 300 to 850 range.';
  }

  return errors;
}

export function validateEmiForm(values: {
  loanAmount: number | string;
  interestRate: number | string;
  tenure: number | string;
  tenureUnit: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  const loan = Number(values.loanAmount);
  if (values.loanAmount === '' || isNaN(loan)) {
    errors.loanAmount = 'Loan amount is required.';
  } else if (loan <= 0) {
    errors.loanAmount = 'Loan amount must be positive.';
  }

  const rate = Number(values.interestRate);
  if (values.interestRate === '' || isNaN(rate)) {
    errors.interestRate = 'Interest rate is required (0% is supported).';
  } else if (rate < 0) {
    errors.interestRate = 'Interest rate cannot be negative.';
  } else if (rate > 50) {
    errors.interestRate = 'Annual interest rate cannot exceed 50%.';
  }

  const tenure = Number(values.tenure);
  if (values.tenure === '' || isNaN(tenure)) {
    errors.tenure = 'Tenure is required.';
  } else if (tenure <= 0) {
    errors.tenure = 'Tenure must be greater than zero.';
  } else if (values.tenureUnit === 'Years' && tenure > 40) {
    errors.tenure = 'Tenure cannot exceed 40 years.';
  } else if (values.tenureUnit === 'Months' && tenure > 480) {
    errors.tenure = 'Tenure cannot exceed 480 months.';
  }

  return errors;
}

export function validateCreditForm(values: {
  creditScore: number | string;
  monthlyIncome: number | string;
  existingEmi: number | string;
  activeLoansCount: number | string;
  creditUtilization: number | string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  const score = Number(values.creditScore);
  if (values.creditScore === '' || isNaN(score)) {
    errors.creditScore = 'Credit score is required.';
  } else if (score < 300 || score > 850) {
    errors.creditScore = 'Credit score must be between 300 and 850.';
  }

  const income = Number(values.monthlyIncome);
  if (values.monthlyIncome === '' || isNaN(income)) {
    errors.monthlyIncome = 'Monthly income is required.';
  } else if (income <= 0) {
    errors.monthlyIncome = 'Monthly income must be positive.';
  }

  const emi = Number(values.existingEmi);
  if (values.existingEmi === '' || isNaN(emi)) {
    errors.existingEmi = 'Existing EMI is required (enter 0 if none).';
  } else if (emi < 0) {
    errors.existingEmi = 'EMI cannot be negative.';
  }

  const active = Number(values.activeLoansCount);
  if (values.activeLoansCount === '' || isNaN(active)) {
    errors.activeLoansCount = 'Active loans count is required.';
  } else if (active < 0) {
    errors.activeLoansCount = 'Cannot be negative.';
  }

  const util = Number(values.creditUtilization);
  if (values.creditUtilization === '' || isNaN(util)) {
    errors.creditUtilization = 'Credit utilization is required.';
  } else if (util < 0 || util > 100) {
    errors.creditUtilization = 'Utilization percentage must be between 0% and 100%.';
  }

  return errors;
}
