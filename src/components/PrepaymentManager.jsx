import React, { useState } from 'react';
import FormattedNumberInput from './FormattedNumberInput';
import FormattedDateInput from './FormattedDateInput';

const PrepaymentManager = ({ prepayments, setPrepayments }) => {
    const [activeTab, setActiveTab] = useState('oneTime');
    const [newOneTime, setNewOneTime] = useState({ date: '', amount: '' });

    // Helpers for One Time
    const addOneTime = () => {
        if (newOneTime.date && newOneTime.amount) {
            setPrepayments({
                ...prepayments,
                oneTime: [...prepayments.oneTime, { ...newOneTime, id: Date.now() }]
            });
            setNewOneTime({ date: '', amount: '' });
        }
    };

    const removeOneTime = (id) => {
        setPrepayments({
            ...prepayments,
            oneTime: prepayments.oneTime.filter(p => p.id !== id)
        });
    };

    // Helpers for Recurring
    const updateMonthly = (field, value) => {
        setPrepayments({
            ...prepayments,
            monthly: { ...prepayments.monthly, [field]: value }
        });
    };

    const updateYearly = (field, value) => {
        setPrepayments({
            ...prepayments,
            yearly: { ...prepayments.yearly, [field]: value }
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
                                <FormattedNumberInput
                                    value={newOneTime.amount}
                                    onChange={(val) => setNewOneTime({ ...newOneTime, amount: val })}
                                    placeholder="Amount"
                                />
                            </div>
                            <button className="btn-add" onClick={addOneTime}>+</button>
                        </div>
                        <div className="prepayment-list">
                            {prepayments.oneTime.length === 0 && <p className="empty-text">No prepayments added.</p>}
                            {prepayments.oneTime.map((p) => (
                                <div key={p.id} className="prepayment-item">
                                    <span>{p.date.split('-').reverse().join('/')}</span>
                                    <span>₹{Number(p.amount).toLocaleString('en-IN')}</span>
                                    <button className="btn-remove" onClick={() => removeOneTime(p.id)}>×</button>
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
                                value={prepayments.monthly.date}
                                onChange={(val) => updateMonthly('date', val)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Monthly Amount (INR)</label>
                            <FormattedNumberInput
                                value={prepayments.monthly.amount}
                                onChange={(val) => updateMonthly('amount', val)}
                                placeholder="e.g. 10,000"
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
                                value={prepayments.yearly.date}
                                onChange={(val) => updateYearly('date', val)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Yearly Amount (INR)</label>
                            <FormattedNumberInput
                                value={prepayments.yearly.amount}
                                onChange={(val) => updateYearly('amount', val)}
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
