import React from 'react';
import FormattedNumberInput from './FormattedNumberInput';
import FormattedDateInput from './FormattedDateInput';

interface LoanData {
    principal: string;
    rate: string;
    tenure: string;
    startDate: string;
}

interface LoanFormProps {
    data: LoanData;
    handleChange: (e: { target: { name: string; value: string } }) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ data, handleChange }) => {
    const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange({
            target: { name: 'principal', value: e.target.value }
        });
    };

    const handleDateChange = (value: string) => {
        handleChange({
            target: { name: 'startDate', value }
        });
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
