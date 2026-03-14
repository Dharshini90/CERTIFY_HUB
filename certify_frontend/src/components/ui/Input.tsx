import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, showPasswordToggle, type, ...props }, ref) => {
        const [showPwd, setShowPwd] = useState(false);
        const isPasswordField = type === 'password';
        const inputType = isPasswordField && showPasswordToggle ? (showPwd ? 'text' : 'password') : type;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className="block text-sm font-semibold text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type={inputType}
                        className={cn(
                            'w-full px-4 py-2.5 bg-white/50 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-slate-400',
                            error
                                ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                : 'border-slate-200 focus:ring-primary-500/10 focus:border-primary-500',
                            isPasswordField && showPasswordToggle ? 'pr-11' : '',
                            className
                        )}
                        {...props}
                    />
                    {isPasswordField && showPasswordToggle && (
                        <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            aria-label={showPwd ? 'Hide password' : 'Show password'}
                        >
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full inline-block" />
                    {error}
                </p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
