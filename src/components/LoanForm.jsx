import React from 'react';
import FormattedNumberInput from './FormattedNumberInput';
import FormattedDateInput from './FormattedDateInput';

const LoanForm = ({ data, handleChange }) => {

    const handlePrincipalChange = (rawValue) => {
        handleChange({ target: { name: 'principal', value: rawValue } });
    };

    const handleDateChange = (isoDate) => {
        handleChange({ target: { name: 'startDate', value: isoDate } });
    };

    return (
        <div className="card form-card">
            <h2>Loan Details</h2>
            <div className="form-group">
                <label>Principal Amount (INR)</label>
                <FormattedNumberInput
                    name="principal"
                    value={data.principal}
                    onChange={handlePrincipalChange}
                    placeholder="e.g. 50,00,000"
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Interest Rate (%)</label>
                    <input
                        type="number"
                        name="rate"
                        value={data.rate}
                        onChange={handleChange}
                        placeholder="e.g. 8.5"
                        step="0.1"
                    />
                </div>
                <div className="form-group">
                    <label>Tenure (Years)</label>
                    <input
                        type="number"
                        name="tenure"
                        value={data.tenure}
                        onChange={handleChange}
                        placeholder="e.g. 20"
                    />
                </div>
            </div>
            <div className="form-group">
                <label>Start Date</label>
                <FormattedDateInput
                    value={data.startDate}
                    onChange={handleDateChange}
                />
            </div>
        </div>
    );
};

export default LoanForm;
