import React, { useState, useMemo } from 'react';
import { formatCurrency, formatDate } from '../utils/loanCalculator';

const AmortizationTable = ({ schedule }) => {
    const [expandedYears, setExpandedYears] = useState({});

    // Group schedule by year
    const groupedSchedule = useMemo(() => {
        if (!schedule || schedule.length === 0) return [];

        const groups = {};
        schedule.forEach((row) => {
            const year = row.date.getFullYear();
            if (!groups[year]) {
                groups[year] = {
                    year,
                    rows: [],
                    startDate: row.date,
                    openingBalance: row.openingBalance,
                    startEmi: row.emi,
                    totalPrincipal: 0,
                    totalInterest: 0,
                    totalPrepayment: 0,
                    totalPayment: 0,
                    closingBalance: 0
                };
            }

            const group = groups[year];
            group.rows.push(row);
            group.totalPrincipal += row.principalComponent;
            group.totalInterest += row.interest;
            group.totalPrepayment += row.prepayment;
            group.totalPayment += (row.emi + row.prepayment);
            group.closingBalance = row.closingBalance;
        });

        return Object.values(groups).sort((a, b) => a.year - b.year);
    }, [schedule]);

    const toggleYear = (year) => {
        setExpandedYears(prev => ({
            ...prev,
            [year]: !prev[year]
        }));
    };

    if (!schedule || schedule.length === 0) return null;

    return (
        <div className="card table-card">
            <h2>Amortization Schedule</h2>

            <div className="table-responsive">
                <table className="main-table">
                    <thead>
                        <tr>
                            <th>Year/Month</th>
                            <th>Date</th>
                            <th>Opening Bal</th>
                            <th>EMI</th>
                            <th>Interest</th>
                            <th>Principal</th>
                            <th>Prepayment</th>
                            <th>Closing Bal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupedSchedule.map((group) => (
                            <React.Fragment key={group.year}>
                                {/* Year Summary Row */}
                                <tr className="year-row" onClick={() => toggleYear(group.year)}>
                                    <td className="year-cell"><strong>{group.year}</strong></td>
                                    <td>{formatDate(group.startDate)}</td>
                                    <td><strong>{formatCurrency(group.openingBalance)}</strong></td>
                                    <td><strong>{formatCurrency(group.startEmi)}</strong></td>
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
        </div>
    );
};

export default AmortizationTable;
