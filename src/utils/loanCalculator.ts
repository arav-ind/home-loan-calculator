export interface Prepayment {
  amount: number | string;
  date: string;
  id?: number;
}

export interface PrepaymentOptions {
  oneTime?: Prepayment[];
  monthly?: Prepayment;
  yearly?: Prepayment;
}

export interface ScheduleRow {
  month: number;
  date: Date;
  openingBalance: number;
  emi: number;
  interest: number;
  principalComponent: number;
  prepayment: number;
  closingBalance: number;
}

export const calculateEMI = (principal: number, annualRate: number, tenureYears: number): number => {
  const monthlyRate = annualRate / 12 / 100;
  const numMonths = tenureYears * 12;

  if (annualRate === 0) return principal / numMonths;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numMonths)) /
    (Math.pow(1 + monthlyRate, numMonths) - 1)
  );
};

export const generateSchedule = (
  principal: number,
  annualRate: number,
  tenureYears: number,
  startDate: string,
  prepaymentOptions: PrepaymentOptions = {}
): ScheduleRow[] => {
  const { oneTime = [], monthly = null, yearly = null } = prepaymentOptions;

  let balance = principal;
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureYears);

  const schedule: ScheduleRow[] = [];
  let currentDate = new Date(startDate);

  // Sort one-time payments by date
  const sortedOneTime = [...oneTime].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Safe parsing helper
  const parseAmount = (val: string | number | undefined): number => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val) || 0;
  };

  const monthlyAmount = parseAmount(monthly?.amount);
  const monthlyStartDate = monthly?.date ? new Date(monthly.date) : null;

  const yearlyAmount = parseAmount(yearly?.amount);
  const yearlyStartDate = yearly?.date ? new Date(yearly.date) : null;

  let monthCount = 1;
  // Safety break: stop if we exceed 50 years (600 months) or balance is zero
  const maxMonths = tenureYears * 12 * 2; // Allow some buffer for longer repayment due to weird inputs

  while (balance > 1 && monthCount <= maxMonths) {
    // Interest for this month
    const interest = balance * monthlyRate;

    // Principal component in normal EMI
    let principalComponent = emi - interest;

    // Total payment including prepayments
    let totalPaymentForMonth = emi;
    let totalPrepayment = 0;

    // 1. One-time prepayments for this specific month/year
    // Check if any one-time payment falls in this month
    const currentMonthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM

    sortedOneTime.forEach(p => {
      if (p.date.startsWith(currentMonthStr)) {
        totalPrepayment += parseAmount(p.amount);
      }
    });

    // 2. Monthly recurring
    if (monthlyStartDate && monthlyAmount > 0) {
      if (currentDate >= monthlyStartDate) {
        totalPrepayment += monthlyAmount;
      }
    }

    // 3. Yearly recurring
    if (yearlyStartDate && yearlyAmount > 0) {
      // Check if same month
      if (currentDate >= yearlyStartDate && currentDate.getMonth() === yearlyStartDate.getMonth()) {
        totalPrepayment += yearlyAmount;
      }
    }

    // If principal component + prepayment > balance, adjust
    if (principalComponent + totalPrepayment > balance) {
      // Adjust breakdown
      // We can't pay more than balance
      // Last EMI might be smaller
      const remaining = balance;
      // If interest is covered
      if (remaining < principalComponent) {
        principalComponent = remaining;
        totalPrepayment = 0; // Or adjust
      } else {
        // Remaining covers principal component, rest is prepayment
        // Actually, simplest logic:
        // closing balance = 0
        // principal paid = balance
        // We need to figure out how much was from EMI vs Prepayment
        // Usually Prepayment reduces balance directly.

        // Let's stick to standard flow:
        // Total principal out = principalComponent + totalPrepayment
        // Limit it to balance
        const totalPrincipalToPay = principalComponent + totalPrepayment;
        if (totalPrincipalToPay > balance) {
          // Determine how much of the excess is cut from prepayment vs EMI
          // Usually EMI is fixed, prepayment is variable.
          // But here we just close it.
          // Let's say we pay exactly balance.
          // principalComponent remains, reduce prepayment?
          // or reduce principalComponent?
          // If balance < principalComponent, reduce principalComponent.
          if (balance <= principalComponent) {
            principalComponent = balance;
            totalPrepayment = 0;
          } else {
            totalPrepayment = balance - principalComponent;
          }
        }
      }
    }

    balance = balance - principalComponent - totalPrepayment;

    // Ensure no negative balance
    if (balance < 0) balance = 0;

    schedule.push({
      month: monthCount,
      date: new Date(currentDate),
      openingBalance: balance + principalComponent + totalPrepayment,
      emi: emi,
      interest: interest,
      principalComponent: principalComponent,
      prepayment: totalPrepayment,
      closingBalance: balance
    });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    monthCount++;

    if (balance <= 0) break;
  }

  return schedule;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStringOrObject: string | Date): string => {
  if (!dateStringOrObject) return '';
  const date = new Date(dateStringOrObject);
  // Options for '12 Jun 2024'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
