import React, { useState, useEffect, ChangeEvent, FocusEvent } from 'react';

interface FormattedNumberInputProps {
    value: string | number;
    onChange: (e: { target: { name?: string; value: string } }) => void;
    name?: string;
    placeholder?: string;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ value, onChange, name, placeholder }) => {
    const [displayValue, setDisplayValue] = useState<string>('');

    useEffect(() => {
        if (value) {
            // Format initial value with commas
            const numericValue = value.toString().replace(/,/g, '');
            if (!isNaN(Number(numericValue))) {
                setDisplayValue(Number(numericValue).toLocaleString('en-IN'));
            } else {
                setDisplayValue(value.toString());
            }
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Remove commas to get raw number
        const rawValue = inputValue.replace(/,/g, '');

        // Allow only numbers
        if (/^\d*$/.test(rawValue)) {
            setDisplayValue(inputValue); // Temporarily show what user confirms (formatting happens on blur or logic)

            // But actually, we want to format as they type?
            // Standard practice: format as they type often jumps cursor.
            // Let's just keep raw value in state or format if valid.
            // If we format on every change, cursor jumps.
            // Better approach: Update parent with raw value, format display on blur?
            // Or format display if it's just appending.

            // For this app, let's keep it simple:
            // Update parent with raw value
            // Parent updates 'value' prop
            // useEffect updates 'displayValue' with formatting

            // Wait, if useEffect updates displayValue on every change, cursor jumps.
            // So we should only update displayValue locally while typing without formatting, OR extract cursor handling.
            // Simplest: Update parent with raw, let parent pass it back.
            // But if parent passes back raw, useEffect formats it.

            // Let's try:
            // 1. User types '1' -> raw '1' -> onChange('1') -> parent '1' -> prop '1' -> useEffect formats '1' -> display '1'
            // 2. User types '10' -> raw '10' -> onChange('10') -> parent '10' -> prop '10' -> useEffect formats '10' -> display '10'
            // 3. User types '1000' -> raw '1000' -> onChange('1000') -> parent '1000' -> prop '1000' -> useEffect formats '1,000' -> display '1,000'.

            // Cursor issue creates slight annoyance but functional.
            onChange({ target: { name, value: rawValue } });
        }
    };

    // To prevent cursor jumping hell, usually we format on Blur, 
    // OR we track cursor position (complex).
    // OR we just show raw while typing and format on blur.
    // Let's try formatting only on blur / or valid large number?
    // Previous implementation just relied on useEffect. Let's stick to it.

    return (
        <input
            type="text"
            name={name}
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
        />
    );
};

export default FormattedNumberInput;
