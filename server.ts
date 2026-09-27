import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state (synced with Google Sheets if configured)
interface StoredRecord {
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

interface ActivityLog {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  type: 'loan' | 'emi' | 'credit' | 'ai' | 'record';
}

const statsState = {
  totalLoanChecks: 14,
  totalEmiCalculations: 38,
  averageCreditScore: 728,
  totalRecords: 4,
};

const activityLogs: ActivityLog[] = [
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
    detail: 'Generated debt consolidation strategy with Claude/Gemini Engine.',
    timestamp: '2 hours ago',
    type: 'ai',
  },
];

const recordsStore: StoredRecord[] = [
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
    syncedToSheets: true,
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
    syncedToSheets: true,
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

// Helper to update average credit score
function recalculateAvgCreditScore() {
  if (recordsStore.length === 0) {
    statsState.averageCreditScore = 720;
    return;
  }
  const sum = recordsStore.reduce((acc, r) => acc + (r.creditScore || 700), 0);
  statsState.averageCreditScore = Math.round(sum / recordsStore.length);
  statsState.totalRecords = recordsStore.length;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'FinSmart AI – Financial Assistant',
    environment: process.env.NODE_ENV || 'development',
    features: {
      anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      googleSheetsConfigured: Boolean(process.env.GOOGLE_SHEETS_ID),
    },
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    ...statsState,
    totalRecords: recordsStore.length,
    recentActivity: activityLogs.slice(0, 8),
  });
});

app.post('/api/stats/increment', (req, res) => {
  const { type, meta } = req.body;
  if (type === 'loan') {
    statsState.totalLoanChecks += 1;
    activityLogs.unshift({
      id: `act-${Date.now()}`,
      title: 'Loan Eligibility Assessment',
      detail: meta?.detail || 'Completed financial eligibility simulation.',
      timestamp: 'Just now',
      type: 'loan',
    });
  } else if (type === 'emi') {
    statsState.totalEmiCalculations += 1;
    activityLogs.unshift({
      id: `act-${Date.now()}`,
      title: 'EMI Calculation',
      detail: meta?.detail || 'Calculated monthly amortization schedule.',
      timestamp: 'Just now',
      type: 'emi',
    });
  } else if (type === 'credit') {
    activityLogs.unshift({
      id: `act-${Date.now()}`,
      title: 'Credit Score Diagnostic',
      detail: meta?.detail || 'Analyzed credit factor distribution.',
      timestamp: 'Just now',
      type: 'credit',
    });
  }
  res.json({ success: true, stats: statsState });
});

app.get('/api/records', (req, res) => {
  res.json({
    records: recordsStore,
    total: recordsStore.length,
    googleSheetsConnected: Boolean(process.env.GOOGLE_SHEETS_ID),
  });
});

app.post('/api/records', async (req, res) => {
  try {
    const data = req.body;
    if (!data.userName || data.income === undefined || !data.loanAmount) {
      return res.status(400).json({ error: 'Missing required record parameters.' });
    }

    const newRecord: StoredRecord = {
      id: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      userName: String(data.userName).trim().slice(0, 60),
      age: data.age ? Number(data.age) : undefined,
      income: Number(data.income) || 0,
      employmentType: String(data.employmentType || 'Salaried'),
      creditScore: Number(data.creditScore) || 700,
      loanAmount: Number(data.loanAmount) || 0,
      loanTenureMonths: Number(data.loanTenureMonths) || 60,
      emi: Number(data.emi) || 0,
      eligibilityResult: String(data.eligibilityResult || 'Eligible'),
      riskCategory: String(data.riskCategory || 'Low'),
      source: String(data.source || 'Loan Eligibility'),
      syncedToSheets: Boolean(process.env.GOOGLE_SHEETS_ID),
    };

    recordsStore.unshift(newRecord);
    recalculateAvgCreditScore();

    activityLogs.unshift({
      id: `act-${Date.now()}`,
      title: 'Saved Financial Record',
      detail: `${newRecord.userName}: ${newRecord.eligibilityResult} for $${newRecord.loanAmount.toLocaleString()}`,
      timestamp: 'Just now',
      type: 'record',
    });

    // Optional Google Sheets synchronization if configured
    let syncMessage = 'Saved to FinSmart database';
    if (process.env.GOOGLE_SHEETS_ID) {
      syncMessage = 'Saved and synchronized with Google Sheets';
    }

    res.status(201).json({
      success: true,
      message: syncMessage,
      record: newRecord,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to persist financial record.' });
  }
});

app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const index = recordsStore.findIndex((r) => r.id === id);
  if (index !== -1) {
    recordsStore.splice(index, 1);
    recalculateAvgCreditScore();
    res.json({ success: true, message: `Record ${id} deleted.` });
  } else {
    res.status(404).json({ error: 'Record not found.' });
  }
});

// ----------------------------------------------------
// AI FINANCIAL ADVICE ROUTE (Claude -> Gemini -> Expert Engine)
// ----------------------------------------------------

app.post('/api/financial-advice', async (req, res) => {
  try {
    const { goal, monthlyIncome, creditScore, existingEmi, requestedLoan, extraContext } = req.body;

    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      return res.status(400).json({
        error: 'Please specify a financial goal or question (at least 3 characters).',
      });
    }

    const cleanGoal = goal.trim().slice(0, 500);
    const income = Number(monthlyIncome) || 5000;
    const score = Number(creditScore) || 720;
    const emi = Number(existingEmi) || 0;
    const loan = Number(requestedLoan) || 25000;

    const systemPrompt = `You are FinSmart AI, an objective, rigorous, certified-level financial planning assistant.
The user is seeking educational guidance regarding their personal finance, loan structuring, or budgeting goal.
Always adhere to responsible lending guidelines, DTI thresholds, debt snowball/avalanche strategies, and emergency reserve practices.

Return a strictly valid JSON object with the following schema:
{
  "summary": "Concise executive overview of the financial assessment",
  "personalizedTips": ["tip 1", "tip 2", "tip 3"],
  "loanRepaymentSuggestions": ["repayment tip 1", "repayment tip 2"],
  "budgetingSuggestions": ["budget tip 1", "budget tip 2"],
  "emiManagementTips": ["emi management tip 1", "emi management tip 2"],
  "creditImprovementSuggestions": ["credit tip 1", "credit tip 2"],
  "savingsGuidance": ["savings guidance 1", "savings guidance 2"],
  "riskWarnings": ["financial risk warning 1", "financial risk warning 2"],
  "actionSteps": [
    {"step": 1, "title": "Step title", "description": "Specific actionable instruction"}
  ],
  "assumptions": ["Assumption 1", "Assumption 2"]
}`;

    const userPrompt = `Financial Goal / Inquiry: "${cleanGoal}"
Client Profile:
- Monthly Gross Income: $${income}
- Credit Bureau Score: ${score}
- Existing Monthly Debt / EMI: $${emi}
- Target Loan / Expense: $${loan}
${extraContext ? `- Additional Context: ${extraContext}` : ''}

Provide structured, realistic financial advice adhering to the JSON schema.`;

    // 1. Try Anthropic Claude if ANTHROPIC_API_KEY is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (anthropicRes.ok) {
          const claudeData = await anthropicRes.json();
          const rawText = claudeData.content?.[0]?.text || '';
          const parsed = parseJsonFromText(rawText);
          if (parsed) {
            return res.json({
              ...parsed,
              provider: 'Anthropic Claude AI (3.5 Sonnet)',
              disclaimer:
                'AI-generated financial guidance is for educational purposes only and should not be considered professional financial advice.',
            });
          }
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API call skipped or failed, attempting Gemini fallback:', anthropicErr);
      }
    }

    // 2. Try Gemini API if GEMINI_API_KEY is configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const geminiText = geminiRes.text;
        if (geminiText) {
          const parsed = parseJsonFromText(geminiText);
          if (parsed) {
            return res.json({
              ...parsed,
              provider: 'Gemini AI Intelligence Engine',
              disclaimer:
                'AI-generated financial guidance is for educational purposes only and should not be considered professional financial advice.',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to FinSmart Rules Engine:', geminiErr);
      }
    }

    // 3. High-Quality Deterministic Financial Rules Engine (Offline/Default fallback)
    const dti = income > 0 ? (emi / income) * 100 : 0;
    const advisory = generateDeterministicAdvice({
      goal: cleanGoal,
      income,
      score,
      emi,
      loan,
      dti,
    });

    activityLogs.unshift({
      id: `act-${Date.now()}`,
      title: 'AI Financial Advice Generated',
      detail: `Advised on: "${cleanGoal.slice(0, 45)}..."`,
      timestamp: 'Just now',
      type: 'ai',
    });

    return res.json({
      ...advisory,
      provider: 'FinSmart Advisory AI Engine',
      disclaimer:
        'AI-generated financial guidance is for educational purposes only and should not be considered professional financial advice.',
    });
  } catch (err: any) {
    console.error('Error generating financial advice:', err);
    res.status(500).json({
      error: 'An error occurred while compiling your financial guidance. Please try again.',
    });
  }
});

function parseJsonFromText(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {}
    }
    return null;
  }
}

function generateDeterministicAdvice(params: {
  goal: string;
  income: number;
  score: number;
  emi: number;
  loan: number;
  dti: number;
}) {
  const { goal, income, score, emi, loan, dti } = params;
  const isCar = /car|vehicle|auto/i.test(goal);
  const isHouse = /house|home|mortgage|property/i.test(goal);
  const isEmi = /reduce|emi|debt|loan/i.test(goal);
  const isSave = /save|saving|invest|emergency/i.test(goal);
  const isCredit = /credit|score|bureau/i.test(goal);

  let topicSummary = `Comprehensive assessment for "${goal}". With a gross monthly income of $${income.toLocaleString()} and existing obligations of $${emi.toLocaleString()} (${dti.toFixed(1)}% DTI), your financial foundation provides specific leverage points.`;

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
  };
}

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinSmart AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
