import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { cn } from '../utils/cn';
import { Language } from '../utils/translations';

interface LanguageSwitcherProps {
    currentLang: Language;
    onLanguageChange: (lang: Language) => void;
    isScrolled: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLanguageChange, isScrolled }) => {
    return (
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
                onClick={() => onLanguageChange('en')}
                className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    currentLang === 'en'
                        ? "bg-yellow-500 text-blue-950 shadow-lg"
                        : cn("text-white/60 hover:text-white", isScrolled ? "text-blue-100/60" : "")
                )}
            >
                EN
            </button>
            <button
                onClick={() => onLanguageChange('te')}
                className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all font-telugu flex items-center justify-center",
                    currentLang === 'te'
                        ? "bg-yellow-500 text-blue-950 shadow-lg"
                        : cn("text-white/60 hover:text-white", isScrolled ? "text-blue-100/60" : "")
                )}
            >
                <span className="telugu-nudge-down">తెలుగు</span>
            </button>
            <div className="ml-1 mr-2 text-white/20">
                <Languages size={14} />
            </div>
        </div>
    );
};

export default LanguageSwitcher;
