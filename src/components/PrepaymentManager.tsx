import React, { useState } from 'react';
import { formatCurrency, formatDate, Prepayment, PrepaymentOptions } from '../utils/loanCalculator';
import FormattedNumberInput from './FormattedNumberInput';
import FormattedDateInput from './FormattedDateInput';

interface PrepaymentManagerProps {
    prepayments: PrepaymentOptions;
    setPrepayments: React.Dispatch<React.SetStateAction<PrepaymentOptions>>;
}

const PrepaymentManager: React.FC<PrepaymentManagerProps> = ({ prepayments, setPrepayments }) => {
    const [activeTab, setActiveTab] = useState<'oneTime' | 'monthly' | 'yearly'>('oneTime');

    // Local state for One Time addition
    const [newOneTime, setNewOneTime] = useState<{ date: string; amount: string }>({ date: '', amount: '' });

    const addOneTime = () => {
        if (newOneTime.date && newOneTime.amount) {
            setPrepayments({
                ...prepayments,
                oneTime: [
                    ...(prepayments.oneTime || []),
                    { amount: newOneTime.amount, date: newOneTime.date }
                ]
            });
            setNewOneTime({ date: '', amount: '' });
        }
    };

    const removeOneTime = (index: number) => {
        const updated = [...(prepayments.oneTime || [])];
        updated.splice(index, 1);
        setPrepayments({ ...prepayments, oneTime: updated });
    };

    const updateMonthly = (field: keyof Prepayment, value: string) => {
        setPrepayments({
            ...prepayments,
            monthly: { ...prepayments.monthly, [field]: value } as Prepayment
        });
    };

    const updateYearly = (field: keyof Prepayment, value: string) => {
        setPrepayments({
            ...prepayments,
            yearly: { ...prepayments.yearly, [field]: value } as Prepayment
        });
    };

    return (
        <div className="card prepayment-card">
            <h2>Prepayment Options</h2>

            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'oneTime' ? 'active' : ''}`}
                    onClick={() => setActiveTab('oneTime')}
                >
                    One Time
                </button>
                <button
                    className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('monthly')}
                >
                    Monthly
                </button>
                <button
                    className={`tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('yearly')}
                >
                    Yearly
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'oneTime' && (
                    <div className="one-time-section">
                        <div className="add-payment-form">
                            <div className="form-group">
                                <label>Date</label>
                                <FormattedDateInput
                                    value={newOneTime.date}
                                    onChange={(val) => setNewOneTime({ ...newOneTime, date: val })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount (INR)</label>
                                {/* Use FormattedNumberInput with raw state */}
                                <FormattedNumberInput
                                    value={newOneTime.amount}
                                    onChange={(e) => setNewOneTime({ ...newOneTime, amount: e.target.value })}
                                    placeholder="Amount"
                                />
                            </div>
                            <button className="btn-add" onClick={addOneTime}>+</button>
                        </div>

                        <div className="prepayment-list">
                            {(!prepayments.oneTime || prepayments.oneTime.length === 0) && <p className="empty-text">No prepayments added.</p>}
                            {prepayments.oneTime && prepayments.oneTime.map((p, index) => (
                                <div key={index} className="prepayment-item">
                                    <span>{formatDate(p.date)} - {formatCurrency(Number(p.amount))}</span>
                                    <button className="btn-remove" onClick={() => removeOneTime(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'monthly' && (
                    <div className="recurring-section">
                        <p className="description">Add a recurring specific amount to be paid every month starting from a date.</p>
                        <div className="form-group">
                            <label>Start Date</label>
                            <FormattedDateInput
                                value={String(prepayments.monthly?.date || '')}
                                onChange={(val) => updateMonthly('date', val)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Monthly Amount (INR)</label>
                            <FormattedNumberInput
                                value={prepayments.monthly?.amount || ''}
                                onChange={(e) => updateMonthly('amount', e.target.value)}
                                placeholder="e.g. 5000"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'yearly' && (
                    <div className="recurring-section">
                        <p className="description">Add a recurring specific amount to be paid every year on the same month.</p>
                        <div className="form-group">
                            <label>Start Date</label>
                            <FormattedDateInput
                                value={String(prepayments.yearly?.date || '')}
                                onChange={(val) => updateYearly('date', val)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Yearly Amount (INR)</label>
                            <FormattedNumberInput
                                value={prepayments.yearly?.amount || ''}
                                onChange={(e) => updateYearly('amount', e.target.value)}
                                placeholder="e.g. 1,00,000"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrepaymentManager;
