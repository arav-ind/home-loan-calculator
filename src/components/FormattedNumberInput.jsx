import React, { useState, useEffect } from 'react';

const FormattedNumberInput = ({ value, onChange, placeholder, ...props }) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        // Sync display value when prop value changes
        if (value) {
            setDisplayValue(Number(value).toLocaleString('en-IN'));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        const inputValue = e.target.value;
        // Allow digits and single decimal point
        const rawValue = inputValue.replace(/,/g, '');

        if (!isNaN(rawValue)) {
            // Send raw value to parent
            onChange(rawValue);
            // Optimize typing experience: if ends with dot or 0 after dot, keep as is
            // Otherwise, simple formatting might interfere with typing decimals.
            // For this use case (Integers mostly or simple amounts), we can format on blur or be careful.
            // To be safe and premium: Update local display to what user types, format on Blur.
            setDisplayValue(inputValue);
        }
    };

    const handleBlur = () => {
        if (displayValue) {
            const raw = displayValue.replace(/,/g, '');
            if (!isNaN(raw) && raw !== '') {
                setDisplayValue(Number(raw).toLocaleString('en-IN'));
            }
        }
    };

    return (
        <input
            {...props}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
        />
    );
};

export default FormattedNumberInput;
