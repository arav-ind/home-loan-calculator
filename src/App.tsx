import { useState, useEffect } from 'react';
import LoanForm from './components/LoanForm';
import PrepaymentManager from './components/PrepaymentManager';
import AmortizationTable from './components/AmortizationTable';
import LoanCharts from './components/LoanCharts';
import ExportButtons from './components/ExportButtons';
import { generateSchedule, calculateEMI, formatCurrency, formatDate, PrepaymentOptions, ScheduleRow } from './utils/loanCalculator';
import homeIcon from './assets/home.svg';
import './App.css';

interface LoanData {
  principal: string;
  rate: string;
  tenure: string;
  startDate: string;
}

interface SummaryData {
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPrepayment: number;
  completionDate: Date;
  numberOfEmis: number;
  interestSaved: number;
}

function App() {
  const [loanData, setLoanData] = useState<LoanData>({
    principal: '5000000',
    rate: '8.5',
    tenure: '20',
    startDate: new Date().toISOString().split('T')[0]
  });

  // New State Structure
  const [prepayments, setPrepayments] = useState<PrepaymentOptions>({
    oneTime: [],
    monthly: { amount: '', date: '' },
    yearly: { amount: '', date: '' }
  });

  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    const { principal, rate, tenure, startDate } = loanData;
    if (principal && rate && tenure && startDate) {
      const p = parseFloat(principal);
      const r = parseFloat(rate);
      const t = parseFloat(tenure);

      const newSchedule = generateSchedule(p, r, t, startDate, prepayments);
      setSchedule(newSchedule);

      // Calculate Summary
      if (newSchedule.length > 0) {
        const totalPayment = newSchedule.reduce((acc, row) => acc + row.emi + row.prepayment, 0);
        const totalPrincipal = newSchedule.reduce((acc, row) => acc + row.principalComponent, 0);
        const totalInterest = newSchedule.reduce((acc, row) => acc + row.interest, 0);
        const totalPrepayment = newSchedule.reduce((acc, row) => acc + row.prepayment, 0);

        // Calculate Original Interest (without prepayments)
        const originalEMI = calculateEMI(p, r, t);
        const originalTotalPayment = originalEMI * t * 12;
        const originalTotalInterest = originalTotalPayment - p;
        const interestSaved = Math.max(0, originalTotalInterest - totalInterest);

        setSummary({
          totalPayment,
          totalPrincipal,
          totalInterest,
          totalPrepayment,
          completionDate: newSchedule[newSchedule.length - 1].date,
          numberOfEmis: newSchedule.length,
          interestSaved
        });
      }
    }
  }, [loanData, prepayments]);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setLoanData({ ...loanData, [name]: value });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img src={homeIcon} alt="Home Loan Calculator" className="app-logo" />
          <h1>Home Loan Calculator</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="input-section">
          <LoanForm data={loanData} handleChange={handleChange} />
          {/* Pass the full prepayment object and setter */}
          <PrepaymentManager prepayments={prepayments} setPrepayments={setPrepayments} />
        </div>

        {summary && (
          <div className="card summary-card">
            <div className="summary-grid">
              <div className="summary-item">
                <span>Total Principal</span>
                <strong>{formatCurrency(summary.totalPrincipal)}</strong>
              </div>
              <div className="summary-item">
                <span>Total Interest</span>
                <strong>{formatCurrency(summary.totalInterest)}</strong>
              </div>
              <div className="summary-item">
                <span>Total Amount</span>
                <strong>{formatCurrency(summary.totalPayment)}</strong>
              </div>

              {summary.totalPrepayment > 0 && (
                <div className="summary-item highlight-teal">
                  <span>Total Prepayment</span>
                  <strong>{formatCurrency(summary.totalPrepayment)}</strong>
                </div>
              )}

              <div className="summary-item highlight-green">
                <span>Interest Saved</span>
                <strong>{formatCurrency(summary.interestSaved)}</strong>
              </div>

              <div className="summary-item">
                <span>Last EMI Date</span>
                <strong>{formatDate(summary.completionDate)}</strong>
              </div>
              <div className="summary-item">
                <span>No. of EMIs</span>
                <strong>{summary.numberOfEmis}</strong>
              </div>
            </div>
          </div>
        )}

        {summary && schedule.length > 0 && (
          <LoanCharts schedule={schedule} summary={summary} />
        )}

        {summary && schedule.length > 0 && (
          <ExportButtons schedule={schedule} summary={summary} loanData={loanData} />
        )}

        <AmortizationTable schedule={schedule} />
      </main>
    </div>
  );
}

export default App;
