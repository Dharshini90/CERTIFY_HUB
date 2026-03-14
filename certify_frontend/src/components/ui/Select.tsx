import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 appearance-none cursor-pointer',
                            error
                                ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                : 'border-slate-200 focus:ring-primary-500/10 focus:border-primary-500',
                            className
                        )}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && <p className="mt-1 text-sm text-red-600 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full inline-block" />
                    {error}
                </p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
