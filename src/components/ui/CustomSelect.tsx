'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options?: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  labelPrefix?: string;
  variant?: 'default' | 'minimal';
  triggerClassName?: string;
}

export default function CustomSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select option',
  className = '',
  labelPrefix = '',
  variant = 'default',
  triggerClassName = ''
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );

  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const triggerStyles = variant === 'minimal' 
    ? `px-2 py-1 text-[11px]`
    : `bg-card border border-border px-3 py-2 text-[13px] text-foreground/80 hover:border-primary/30 ${isOpen ? 'ring-2 ring-primary/10 border-primary/50' : ''}`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1.5 rounded-lg font-medium outline-none transition-all ${triggerStyles} ${triggerClassName}`}
      >
        <span className="truncate">
          {labelPrefix && <span className="text-muted-foreground mr-1">{labelPrefix}:</span>}
          {displayValue}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-[110] bg-card border border-border rounded-xl shadow-xl py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-[280px] overflow-y-auto scrollbar-themed">
            {options.map((opt, i) => {
              const optVal = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const isSelected = optVal === value;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(optVal)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-[13px] transition-all text-left ${
                    isSelected 
                      ? 'bg-primary/10 text-primary font-medium hover:bg-primary/20' 
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
