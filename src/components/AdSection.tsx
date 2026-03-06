import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Phone, Megaphone, ExternalLink, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

interface Advertisement {
    id: string;
    imageUrl: string;
    contactNumber: string;
    websiteUrl?: string;
}

interface AdSectionProps {
    currentLang: Language;
}

const AdSection: React.FC<AdSectionProps> = ({ currentLang }) => {
    const t = translations[currentLang];
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'advertisements'), orderBy('createdAt', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                imageUrl: doc.data().imageUrl,
                contactNumber: doc.data().contactNumber,
                websiteUrl: doc.data().websiteUrl || null,
            })) as Advertisement[];
            setAds(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading || ads.length === 0) return null;

    return (
        <section className="py-12 md:py-16 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className={cn(
                            "inline-flex items-center gap-2 px-5 py-2 bg-yellow-500/10 rounded-full text-yellow-600 text-[11px] font-black uppercase tracking-[0.3em] mb-6",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}
                    >
                        <Sparkles size={14} />
                        <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                            {t.ads.badge}
                        </span>
                    </motion.div>
                    <h2 className={cn(
                        "text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-5",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.ads.title.split(' ').length > 1 ? (
                            <>
                                {t.ads.title.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{t.ads.title.split(' ').slice(-1)}</span>
                            </>
                        ) : (
                            t.ads.title
                        )}
                    </h2>
                    <p className={cn(
                        "text-gray-500 text-lg font-medium max-w-xl mx-auto leading-relaxed",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.ads.description}
                    </p>
                    <div className="h-1 w-16 bg-blue-500 mx-auto mt-6 rounded-full" />
                </div>
            </div>

            {/* Scrolling Marquee - Full Width */}
            <div className="relative w-full overflow-hidden py-10">
                {/* Edge Masks */}
                <div className="absolute inset-y-0 left-0 w-8 md:w-24 lg:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 md:w-24 lg:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex gap-10 items-center px-4"
                    animate={{
                        x: [0, -1 * (ads.length * 420)]
                    }}
                    transition={{
                        x: {
                            duration: ads.length * 7,
                            repeat: Infinity,
                            ease: "linear"
                        }
                    }}
                >
                    {/* Quadruple list for seamless loop on all screen sizes */}
                    {[...ads, ...ads, ...ads, ...ads].map((ad, idx) => (
                        <div key={`${ad.id}-${idx}`} className="w-[380px] shrink-0 py-4">
                            <AdCard ad={ad} currentLang={currentLang} />
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const AdCard: React.FC<{ ad: Advertisement; currentLang: Language }> = ({ ad, currentLang }) => {
    const t = translations[currentLang];
    const handleClick = () => {
        if (ad.websiteUrl) {
            window.open(ad.websiteUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group relative bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border border-gray-100 shadow-[var(--shadow-premium)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 ${ad.websiteUrl ? 'cursor-pointer' : ''}`}
        >
            {/* Sponsored tag */}
            <div className={cn(
                "absolute top-5 left-5 z-20 flex items-center justify-center gap-1.5 bg-black/30 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                currentLang === 'te' ? "font-telugu" : ""
            )}>
                <Megaphone size={10} className="text-yellow-400" />
                <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                    {t.ads.card.sponsored}
                </span>
            </div>

            {/* Image Area */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={ad.imageUrl}
                    alt="Property Advertisement"
                    className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {ad.websiteUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                        <div className={cn(
                            "bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl px-6 py-3 flex items-center gap-2 text-blue-900 text-xs font-black shadow-2xl",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}>
                            <ExternalLink size={14} />
                            {t.ads.card.visit}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Area */}
            <div className="p-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className={cn(
                            "text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1.5",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}>{t.ads.card.inquiry}</p>
                        <p className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{ad.contactNumber}</p>
                    </div>
                    <a
                        href={`tel:${ad.contactNumber}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center transition-all duration-500 hover:from-blue-500 hover:to-blue-700 hover:scale-110 hover:-rotate-6 shadow-[0_5px_15px_rgba(30,58,138,0.3)]"
                    >
                        <Phone size={18} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdSection;
