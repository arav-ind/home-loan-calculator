import React, { useMemo, useState } from 'react';
import { formatCurrency, formatDate, ScheduleRow } from '../utils/loanCalculator';

interface AmortizationTableProps {
    schedule: ScheduleRow[];
}

interface YearGroup {
    year: number;
    rows: ScheduleRow[];
    totalPrincipal: number;
    totalInterest: number;
    totalPrepayment: number;
    totalPayment: number;
    closingBalance: number;
    startDate: string | Date;
    openingBalance: number;
    startEmi: number;
    startMonth: number;
    endMonth: number;
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule }) => {
    const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

    const toggleYear = (year: number) => {
        setExpandedYears(prev => ({
            ...prev,
            [year]: !prev[year]
        }));
    };

    const groupedSchedule = useMemo(() => {
        if (!schedule || schedule.length === 0) return [];

        const groups: Record<number, YearGroup> = {};
        schedule.forEach((row) => {
            const year = row.date.getFullYear();
            if (!groups[year]) {
                groups[year] = {
                    year,
                    rows: [],
                    totalPrincipal: 0,
                    totalInterest: 0,
                    totalPrepayment: 0,
                    totalPayment: 0,
                    closingBalance: 0,
                    startDate: row.date,
                    openingBalance: row.openingBalance,
                    startEmi: row.emi,
                    startMonth: row.month,
                    endMonth: row.month
                };
            }

            const group = groups[year];
            group.rows.push(row);
            group.totalPrincipal += row.principalComponent;
            group.totalInterest += row.interest;
            group.totalPrepayment += row.prepayment;
            group.totalPayment += (row.emi + row.prepayment);
            group.closingBalance = row.closingBalance;
            group.endMonth = row.month; // Always update endMonth to the current row's month
        });

        return Object.values(groups).sort((a, b) => a.year - b.year);
    }, [schedule]);

    if (!schedule || schedule.length === 0) return null;

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>EMI No.</th>
                        <th>Date / Year</th>
                        <th>Opening Balance</th>
                        <th>EMI</th>
                        <th>Interest</th>
                        <th>Principal</th>
                        <th>Prepayment</th>
                        <th>Closing Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedSchedule.map((group) => (
                        <React.Fragment key={group.year}>
                            {/* Year Summary Row - Clickable */}
                            <tr
                                className={`year-row ${expandedYears[group.year] ? 'expanded' : ''}`}
                                onClick={() => toggleYear(group.year)}
                            >
                                <td>
                                    <strong>{group.startMonth}</strong>
                                    <div className="sub-text" style={{ fontSize: '0.85em', fontWeight: 'normal', opacity: 0.8 }}>
                                        {group.endMonth}
                                    </div>
                                </td>
                                <td className="year-cell">
                                    <strong>{group.year}</strong>
                                    <div className="sub-text" style={{ fontSize: '0.85em', fontWeight: 'normal', opacity: 0.8 }}>
                                        {formatDate(group.startDate)}
                                    </div>
                                </td>
                                <td>{formatCurrency(group.openingBalance)}</td>
                                <td>{formatCurrency(group.startEmi)}</td>
                                <td><strong>{formatCurrency(group.totalInterest)}</strong></td>
                                <td><strong>{formatCurrency(group.totalPrincipal)}</strong></td>
                                <td>
                                    {group.totalPrepayment > 0 ? <strong>{formatCurrency(group.totalPrepayment)}</strong> : '-'}
                                </td>
                                <td><strong>{formatCurrency(group.closingBalance)}</strong></td>
                            </tr>

                            {/* Monthly Details */}
                            {expandedYears[group.year] && group.rows.map((row) => (
                                <tr key={row.month} className={`month-row ${row.prepayment > 0 ? 'highlight-row' : ''}`}>
                                    <td>{row.month}</td>
                                    <td>{formatDate(row.date)}</td>
                                    <td>{formatCurrency(row.openingBalance)}</td>
                                    <td>{formatCurrency(row.emi)}</td>
                                    <td>{formatCurrency(row.interest)}</td>
                                    <td>{formatCurrency(row.principalComponent)}</td>
                                    <td>{row.prepayment > 0 ? formatCurrency(row.prepayment) : '-'}</td>
                                    <td>{formatCurrency(row.closingBalance)}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AmortizationTable;
