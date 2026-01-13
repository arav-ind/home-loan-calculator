import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { ScheduleRow, formatCurrency } from '../utils/loanCalculator';

interface SummaryData {
    totalPrincipal: number;
    totalInterest: number;
    totalPayment: number;
    totalPrepayment: number;
}

interface LoanChartsProps {
    schedule: ScheduleRow[];
    summary: SummaryData;
}

const LoanCharts: React.FC<LoanChartsProps> = ({ schedule, summary }) => {
    const pieData = useMemo(() => {
        const data = [
            { name: 'Principal', value: summary.totalPrincipal },
            { name: 'Interest', value: summary.totalInterest },
        ];
        if (summary.totalPrepayment > 0) {
            data.push({ name: 'Prepayment', value: summary.totalPrepayment });
        }
        return data;
    }, [summary]);

    const COLORS = ['#ec4899', '#6d28d9', '#14b8a6']; // Pink (Principal), Purple (Interest), Teal (Prepayment)

    /* Removed unused areaData calculation logic */

    // Sample schedule for smoother chart rendering (every 6th month + last month)
    const chartData = useMemo(() => {
        return schedule.filter((_, index) => index % 6 === 0 || index === schedule.length - 1).map(row => ({
            date: row.date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            balance: Math.round(row.closingBalance),
            interest: Math.round(row.interest),
            principal: Math.round(row.principalComponent)
        }));
    }, [schedule]);


    return (
        <div className="charts-container">
            <div className="chart-card">
                <h3>Total Payment Breakup</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => [formatCurrency(value || 0), '']}
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card">
                <h3>Loan Balance Over Time</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} tickLine={false} axisLine={false} />
                            <Tooltip
                                formatter={(value: number | undefined) => [formatCurrency(value || 0), 'Balance']}
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.1)', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Area type="monotone" dataKey="balance" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorBalance)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default LoanCharts;
