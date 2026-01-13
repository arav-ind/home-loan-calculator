import React, { useState, useEffect } from 'react';

// Displays DD/MM/YYYY, returns YYYY-MM-DD
const FormattedDateInput = ({ value, onChange, ...props }) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        if (value) {
            // Input value is YYYY-MM-DD
            const [year, month, day] = value.split('-');
            if (year && month && day) {
                setDisplayValue(`${day}/${month}/${year}`);
            }
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        const input = e.target.value;

        // Remove all non-digit chars to handle backspaces and clean input
        const numbers = input.replace(/\D/g, '');

        // Limit to 8 digits (DDMMYYYY)
        const charCode = numbers.slice(0, 8);

        let formatted = charCode;
        if (charCode.length >= 3) {
            formatted = `${charCode.slice(0, 2)}/${charCode.slice(2)}`;
        }
        if (charCode.length >= 5) {
            formatted = `${charCode.slice(0, 2)}/${charCode.slice(2, 4)}/${charCode.slice(4)}`;
        }

        setDisplayValue(formatted);
    };

    const handleBlur = () => {
        // Parse DD/MM/YYYY
        const parts = displayValue.split('/');
        let day, month, year;

        if (parts.length === 3) {
            day = parts[0];
            month = parts[1];
            year = parts[2];

            // Basic validation
            if (day && month && year && year.length === 4) {
                // Ensure day/month are 2 digits
                day = day.padStart(2, '0');
                month = month.padStart(2, '0');

                if (day > 0 && day <= 31 && month > 0 && month <= 12) {
                    const isoDate = `${year}-${month}-${day}`;
                    onChange(isoDate);
                    setDisplayValue(`${day}/${month}/${year}`);
                    return;
                }
            }
        }

        // If incomplete or invalid, we reset to original value or clear?
        // Better to check if we can restore from props if invalid
        if (value) {
            const [y, m, d] = value.split('-');
            if (y && m && d) {
                setDisplayValue(`${d}/${m}/${y}`);
            } else {
                setDisplayValue('');
            }
        } else {
            setDisplayValue(''); // Clear if invalid and no previous value
        }
    };

    return (
        <input
            {...props}
            type="text"
            placeholder="DD/MM/YYYY"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength="10"
        />
    );
};

export default FormattedDateInput;
