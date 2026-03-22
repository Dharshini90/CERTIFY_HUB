'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface NavItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

interface MobileNavProps {
    items: NavItem[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div className="md:hidden flex items-center">
            <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 !p-0 border-slate-200/60 bg-white/50 backdrop-blur-md rounded-xl shadow-sm hover:bg-white"
            >
                <Menu className="w-5 h-5 text-slate-600" />
            </Button>

            {/* Backdrop & Drawer */}
            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex justify-end">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div 
                        className={cn(
                            "relative w-[280px] h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-100",
                            isOpen ? "translate-x-0" : "translate-x-full"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                    <Menu className="w-5 h-5" />
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-all border border-slate-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Main Menu</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dashboard Navigation</p>
                            </div>
                        </div>

                        {/* Nav Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                            {items.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        item.onClick();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group border border-transparent shadow-sm",
                                        item.variant === 'danger' 
                                            ? "bg-rose-50/50 text-rose-600 hover:bg-rose-50 hover:border-rose-100" 
                                            : "bg-slate-50/50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white shadow-sm ring-1 ring-slate-100",
                                        item.variant === 'danger'
                                            ? "text-rose-500 group-hover:scale-110"
                                            : "text-slate-400 group-hover:text-indigo-500 group-hover:scale-110"
                                    )}>
                                        {/* Simplified icon rendering */}
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">
                                CertifyHub Mobile v1.0
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};
