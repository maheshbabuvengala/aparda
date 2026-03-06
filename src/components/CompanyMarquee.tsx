import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { Handshake, ShieldCheck, Globe, ExternalLink } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

interface Partner {
    id: string;
    companyName: string;
    logoUrl: string;
    website: string;
    name?: string;
    isRegistered?: boolean;
}

interface CompanyMarqueeProps {
    currentLang: Language;
}

const CompanyMarquee: React.FC<CompanyMarqueeProps> = ({ currentLang }) => {
    const t = translations[currentLang];
    const [partners, setPartners] = useState<Partner[]>([]);

    useEffect(() => {
        const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((p: any) => p.isRegistered !== false) as Partner[];
            setPartners(list);
        });
        return () => unsubscribe();
    }, []);

    if (partners.length === 0) return null;

    return (
        <section className="py-12 md:py-20 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className={cn(
                            "inline-flex items-center gap-2 px-5 py-2 bg-blue-600/10 rounded-full text-blue-600 text-[11px] font-black uppercase tracking-[0.3em] mb-6",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}
                    >
                        <Handshake size={13} />
                        <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                            {t.collaborators.badge}
                        </span>
                    </motion.div>
                    <h2 className={cn(
                        "text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-5",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.collaborators.title.split(' ').length > 1 ? (
                            <>
                                {t.collaborators.title.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{t.collaborators.title.split(' ').slice(-1)}</span>
                            </>
                        ) : (
                            t.collaborators.title
                        )}
                    </h2>
                    <p className={cn(
                        "text-gray-500 text-lg font-medium max-w-xl mx-auto leading-relaxed",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.collaborators.description}
                    </p>
                    <div className="h-1 w-16 bg-yellow-500 mx-auto mt-6 rounded-full" />
                </div>
            </div>

            {/* Scrolling Marquee - Full Width */}
            <div className="relative w-full overflow-hidden py-10">
                <div className="absolute inset-y-0 left-0 w-8 md:w-24 lg:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 md:w-24 lg:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex gap-10 items-center px-4"
                    animate={{
                        x: [0, -1 * (partners.length * 380)]
                    }}
                    transition={{
                        x: {
                            duration: partners.length * 8,
                            repeat: Infinity,
                            ease: "linear"
                        }
                    }}
                >
                    {[...partners, ...partners, ...partners, ...partners].map((partner, idx) => (
                        <div key={`${partner.id}-${idx}`} className="w-[340px] shrink-0 py-4">
                            <PartnerCard partner={partner} idx={idx} currentLang={currentLang} />
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-center gap-10 md:gap-20 mt-16 pt-14 border-t border-gray-100"
                >
                    {[
                        { count: `${partners.length}+`, label: t.collaborators.stats.members },
                        { count: '100%', label: t.collaborators.stats.verified },
                        { count: 'AP', label: t.collaborators.stats.coverage }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-5xl font-black text-blue-600 tracking-tighter leading-none">{stat.count}</p>
                            <p className={cn(
                                "text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

const PartnerCard: React.FC<{ partner: Partner; idx: number; currentLang: Language }> = ({ partner, idx, currentLang }) => {
    const t = translations[currentLang];
    const hostname = (() => {
        try { return new URL(partner.website).hostname.replace('www.', ''); }
        catch { return partner.website; }
    })();

    return (
        <motion.a
            href={partner.website || '#'}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.07, duration: 0.7, ease: 'easeOut' }}
            whileHover={{ y: -6 }}
            className="group relative flex flex-col bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-700 cursor-pointer"
        >
            {/* Verified badge */}
            <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 bg-green-50/80 backdrop-blur-md border border-green-100/50 text-green-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm font-telugu">
                <ShieldCheck size={10} className="text-green-500" />
                {t.collaborators.card.verified}
            </div>

            {/* Logo Area */}
            <div className="relative bg-gradient-to-br from-slate-50/50 to-white flex items-center justify-center p-10 pb-8 min-h-[160px] overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-blue-50/40 via-transparent to-yellow-50/30" />
                <img
                    src={partner.logoUrl}
                    alt={partner.companyName}
                    className="max-h-24 max-w-full object-contain relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:drop-shadow-xl drop-shadow-md"
                />
            </div>

            {/* Info */}
            <div className="p-8 pt-0 flex flex-col gap-4 flex-1">
                <div className="h-px w-full bg-slate-100" />

                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors duration-500">
                        {partner.companyName}
                    </h3>
                    <p className={cn(
                        "text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-[0.2em]",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>{partner.name || t.collaborators.card.member}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Globe size={11} />
                        <span className="text-[10px] font-bold truncate max-w-[120px]">{hostname}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-400 shadow-sm">
                        <ExternalLink size={12} />
                    </div>
                </div>
            </div>
        </motion.a>
    );
};

export default CompanyMarquee;
