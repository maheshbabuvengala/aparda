import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Mic2, Phone } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

interface NewsTickerProps {
    currentLang: Language;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ currentLang }) => {
    const t = translations[currentLang];
    const [tickerText, setTickerText] = useState('For Advertisements Contact: 9381574024 | AP-ARDA Premium Listings | ⭐ Register Your Property Today');
    const [contactNumber, setContactNumber] = useState('9381574024');

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.adTickerText) setTickerText(data.adTickerText);
                if (data.adTickerContact) setContactNumber(data.adTickerContact);
            }
        });
        return () => unsubscribe();
    }, []);



    return (
        <div className="relative w-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 overflow-hidden border-y border-blue-800/50 shadow-inner">
            {/* Left badge */}
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center">
                <div className="flex items-center gap-2 bg-yellow-500 px-5 h-full">
                    <div className="relative">
                        <Mic2 size={16} className="text-blue-950 fill-blue-950" />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"
                        />
                    </div>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-[0.2em] text-blue-950 whitespace-nowrap hidden sm:block",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.footer.news}
                    </span>
                </div>
                {/* Fade-out mask */}
                <div className="w-12 h-full bg-gradient-to-r from-blue-950 to-transparent" />
            </div>

            {/* Scrolling Text */}
            <div className="flex overflow-hidden py-3 ml-28 sm:ml-36">
                <motion.div
                    className="flex items-center gap-2 whitespace-nowrap"
                    animate={{ x: ['0%', '-33.33%'] }}
                    transition={{
                        x: { repeat: Infinity, repeatType: 'loop', duration: 30, ease: 'linear' }
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <React.Fragment key={i}>
                            <span className="text-sm text-blue-100 font-semibold tracking-wide pr-2">
                                {tickerText}
                            </span>
                            <a
                                href={`tel:${contactNumber}`}
                                className="inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-4 py-0.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-blue-950 transition-all shrink-0 mx-6"
                            >
                                <Phone size={10} />
                                {contactNumber}
                            </a>
                            <span className="text-blue-700 mx-4 shrink-0 text-lg">●</span>
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>

            {/* Right fade mask */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-950 to-transparent z-10 pointer-events-none" />
        </div>
    );
};

export default NewsTicker;
