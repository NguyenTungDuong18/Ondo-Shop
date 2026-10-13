import React, { useEffect, useRef } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(length, '').slice(0, length).split('');

  useEffect(() => {
    const firstEmpty = value.padEnd(length, '').slice(0, length).split('').findIndex((d) => !d);
    const focusIndex = firstEmpty === -1 ? length - 1 : firstEmpty;
    inputRefs.current[focusIndex]?.focus();
  }, [value, length]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    const newValue = newDigits.join('');

    onChange(newValue);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Paste') {
      e.preventDefault();
      const pasted = (e as unknown as React.ClipboardEvent<HTMLInputElement>).clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      onChange(pasted);
    }
  };

  const handleFocus = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => handleFocus(i)}
          className="w-11 h-14 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-bold border-2 border-zinc-300 rounded-xl sm:rounded-2xl bg-white text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 transition-all disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed shadow-sm"
          style={{ caretColor: 'transparent' }}
        />
      ))}
    </div>
  );
};
