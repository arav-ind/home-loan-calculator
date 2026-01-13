import React, { useState, useEffect, ChangeEvent } from 'react';

interface FormattedDateInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const FormattedDateInput: React.FC<FormattedDateInputProps> = ({ value, onChange, placeholder = "DD/MM/YYYY" }) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        if (value) {
            const [year, month, day] = value.split('-');
            if (year && month && day) {
                setDisplayValue(`${day}/${month}/${year}`);
            }
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;

        // Remove non-digit characters
        const numericValue = input.replace(/\D/g, '');

        // Format as DD/MM/YYYY
        let formattedValue = numericValue;
        if (numericValue.length > 2) {
            formattedValue = `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
        }
        if (numericValue.length > 4) {
            formattedValue = `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4, 8)}`;
        }

        setDisplayValue(formattedValue);

        // If we have a full date (8 digits), update parent
        if (numericValue.length === 8) {
            const day = numericValue.slice(0, 2);
            const month = numericValue.slice(2, 4);
            const year = numericValue.slice(4, 8);

            // Basic validation
            const date = new Date(`${year}-${month}-${day}`);
            if (
                date instanceof Date &&
                !isNaN(date.getTime()) &&
                date.getDate() === parseInt(day) &&
                date.getMonth() + 1 === parseInt(month)
            ) {
                onChange(`${year}-${month}-${day}`);
            }
        } else if (numericValue.length === 0) {
            onChange('');
        }
    };

    const handleBlur = () => {
        // Create date object from displayValue to ensure consistency
        // But standard HTML `date` inputs use YYYY-MM-DD
        // Our stored value is YYYY-MM-DD
        // If the user leaves the field and it's incomplete, maybe reset?
        // For now, reliance on 8-digit check in handleChange is primary.
    };

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={10} // DD/MM/YYYY is 10 chars
        />
    );
};

export default FormattedDateInput;
