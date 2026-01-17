'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { Input } from '@/components/ui/input';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CodeInput({ length = 6, value, onChange, disabled }: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [codes, setCodes] = useState<string[]>(
    value.split('').concat(Array(length - value.length).fill(''))
  );

  const handleChange = (index: number, inputValue: string) => {
    const newValue = inputValue.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (newValue.length > 1) {
      // Handle paste
      const chars = newValue.slice(0, length).split('');
      const newCodes = [...codes];
      chars.forEach((char, i) => {
        if (index + i < length) {
          newCodes[index + i] = char;
        }
      });
      setCodes(newCodes);
      onChange(newCodes.join(''));
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = newValue;
    setCodes(newCodes);
    onChange(newCodes.join(''));

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      // If current input is empty and backspace is pressed, go to previous input
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toLowerCase().replace(/[^a-z0-9]/g, '');
    const chars = pastedData.slice(0, length).split('');
    const newCodes = [...codes];
    
    chars.forEach((char, i) => {
      newCodes[i] = char;
    });
    
    setCodes(newCodes);
    onChange(newCodes.join(''));
    
    // Focus last filled input
    const nextIndex = Math.min(chars.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 w-full">
      {codes.map((code, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="text"
          maxLength={1}
          value={code}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="flex-1 h-16 text-center text-7xl font-bold uppercase"
        />
      ))}
    </div>
  );
}
