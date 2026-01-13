
export const calculateEMI = (principal, annualRate, tenureYears) => {
  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export const generateSchedule = (principal, annualRate, tenureYears, startDate, prepaymentOptions = {}) => {
  const { oneTime = [], monthly = null, yearly = null } = prepaymentOptions;

  const r = annualRate / 12 / 100;
  const n = tenureYears * 12;
  let emi = calculateEMI(principal, annualRate, tenureYears);

  let outstandingPrincipal = principal;
  let schedule = [];
  let currentDate = new Date(startDate);

  // Sort one-time prepayments
  const sortedOneTime = [...oneTime].sort((a, b) => new Date(a.date) - new Date(b.date));

  let monthIndex = 1;

  while (outstandingPrincipal > 1 && monthIndex <= n * 2) {
    const interestPayment = outstandingPrincipal * r;
    let principalPayment = emi - interestPayment;

    // Last EMI adjustment
    if (outstandingPrincipal < principalPayment) {
      principalPayment = outstandingPrincipal;
      emi = principalPayment + interestPayment;
    }

    let prepaymentThisMonth = 0;

    // 1. One specific One-time prepayments
    sortedOneTime.forEach(p => {
      const pDate = new Date(p.date);
      // Check if pDate falls in current month/year
      if (pDate.getMonth() === currentDate.getMonth() && pDate.getFullYear() === currentDate.getFullYear()) {
        prepaymentThisMonth += parseFloat(p.amount);
      }
    });

    // 2. Monthly Recurring
    if (monthly && monthly.amount > 0 && monthly.date) {
      const mDate = new Date(monthly.date);
      // Active if currentDate >= monthly start date
      // Comparing year and month
      const currentTotalMonths = currentDate.getFullYear() * 12 + currentDate.getMonth();
      const startTotalMonths = mDate.getFullYear() * 12 + mDate.getMonth();

      if (currentTotalMonths >= startTotalMonths) {
        prepaymentThisMonth += parseFloat(monthly.amount);
      }
    }

    // 3. Yearly Recurring
    if (yearly && yearly.amount > 0 && yearly.date) {
      const yDate = new Date(yearly.date);
      // Active if currentDate >= yearly start date AND month matches
      const currentTotalMonths = currentDate.getFullYear() * 12 + currentDate.getMonth();
      const startTotalMonths = yDate.getFullYear() * 12 + yDate.getMonth();

      if (currentTotalMonths >= startTotalMonths && currentDate.getMonth() === yDate.getMonth()) {
        prepaymentThisMonth += parseFloat(yearly.amount);
      }
    }

    // Cap prepayment to outstanding - principalPayment (cannot pay more than balance)
    // Actually we can pay full balance.
    let totalPayment = principalPayment + prepaymentThisMonth;
    if (totalPayment > outstandingPrincipal) {
      prepaymentThisMonth = outstandingPrincipal - principalPayment;
      totalPayment = outstandingPrincipal;
    }

    let closingBalance = outstandingPrincipal - principalPayment - prepaymentThisMonth;
    if (closingBalance < 0) closingBalance = 0;

    schedule.push({
      month: monthIndex,
      date: new Date(currentDate),
      openingBalance: outstandingPrincipal,
      emi: emi,
      interest: interestPayment,
      principalComponent: principalPayment,
      prepayment: prepaymentThisMonth,
      closingBalance: closingBalance
    });

    outstandingPrincipal = closingBalance;

    currentDate.setMonth(currentDate.getMonth() + 1);
    monthIndex++;

    if (outstandingPrincipal <= 0) break;
  }

  return schedule;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStringOrObject) => {
  if (!dateStringOrObject) return '';
  const date = new Date(dateStringOrObject);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
