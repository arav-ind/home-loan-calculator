import React, { useState, useEffect } from 'react';
import LoanForm from './components/LoanForm';
import PrepaymentManager from './components/PrepaymentManager';
import AmortizationTable from './components/AmortizationTable';
import { generateSchedule, formatCurrency, formatDate } from './utils/loanCalculator';
import './App.css';

function App() {
  const [loanData, setLoanData] = useState({
    principal: '5000000',
    rate: '8.5',
    tenure: '20',
    startDate: new Date().toISOString().split('T')[0]
  });

  // New State Structure
  const [prepayments, setPrepayments] = useState({
    oneTime: [],
    monthly: { amount: '', date: '' },
    yearly: { amount: '', date: '' }
  });

  const [schedule, setSchedule] = useState([]);
  const [summary, setSummary] = useState(null);

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

        setSummary({
          totalPayment,
          totalPrincipal,
          totalInterest,
          totalPrepayment,
          completionDate: newSchedule[newSchedule.length - 1].date
        });
      }
    }
  }, [loanData, prepayments]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanData({ ...loanData, [name]: value });
  };

  return (
    <div className="app-container">
      <header>
        <h1>Home Loan Amortization</h1>
      </header>

      <main className="main-content">
        <div className="input-section">
          <LoanForm data={loanData} handleChange={handleChange} />
          {/* Pass the full prepayment object and setter */}
          <PrepaymentManager prepayments={prepayments} setPrepayments={setPrepayments} />
        </div>

        {summary && (
          <div className="card summary-card">
            <div className="summary-item">
              <span>Total Principal</span>
              <strong>{formatCurrency(summary.totalPrincipal)}</strong>
            </div>

            {/* Show Prepayment if any (or always?) User said "if any", then "like total principal".
                 Let's show it if > 0. If 0, maybe hide or show 0?
                 User said "show prepayment also if any" in previous turn.
                 I will keep > 0 check to keep UI clean if no prepayments.
             */}
            {summary.totalPrepayment > 0 && (
              <div className="summary-item">
                <span>Total Prepayment</span>
                <strong>{formatCurrency(summary.totalPrepayment)}</strong>
              </div>
            )}

            <div className="summary-item">
              <span>Total Interest</span>
              <strong>{formatCurrency(summary.totalInterest)}</strong>
            </div>
            <div className="summary-item">
              <span>Total Amount</span>
              <strong>{formatCurrency(summary.totalPayment)}</strong>
            </div>
            <div className="summary-item">
              <span>Last EMI Date</span>
              <strong>{formatDate(summary.completionDate)}</strong>
            </div>
          </div>
        )}

        <AmortizationTable schedule={schedule} />
      </main>
    </div>
  );
}

export default App;
