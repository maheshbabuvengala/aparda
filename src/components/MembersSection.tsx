import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { ShieldCheck, Star } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

interface Member {
    id: string;
    name: string;
    role: string;
    imageUrl: string;
    order: number;
}

interface MembersSectionProps {
    currentLang: Language;
}

const MembersSection: React.FC<MembersSectionProps> = ({ currentLang }) => {
    const t = translations[currentLang];
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'members'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const memberList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Member[];
            setMembers(memberList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading || members.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-slate-50 relative overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className={cn(
                            "inline-flex items-center gap-2 bg-blue-600/10 text-blue-600 px-5 py-2 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-6",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}
                    >
                        <ShieldCheck size={14} />
                        <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                            {t.team.badge}
                        </span>
                    </motion.div>
                    <h2 className={cn(
                        "text-3xl md:text-6xl font-black text-gray-900 tracking-tighter mb-5 leading-tight",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.team.title.split(' ').length > 1 ? (
                            <>
                                {t.team.title.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{t.team.title.split(' ').slice(-1)}</span>
                            </>
                        ) : (
                            t.team.title
                        )}
                    </h2>
                    <p className={cn(
                        "text-gray-500 max-w-xl mx-auto text-base md:text-lg font-medium leading-relaxed",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.team.description}
                    </p>
                    <div className="h-1 w-16 bg-yellow-500 mx-auto mt-6 rounded-full" />
                </div>

                {/* Members Row — Horizontal Scroll on Mobile */}
                <div className="relative">
                    <div className="flex overflow-x-auto pb-10 gap-6 -mx-6 px-6 no-scrollbar snap-x md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:mx-0 md:px-0 md:pb-0">
                        {members.map((member, idx) => (
                            <div key={member.id} className="min-w-[280px] md:min-w-0 snap-center">
                                {members.length <= 4 ? (
                                    <LargeMemberCard member={member} idx={idx} currentLang={currentLang} />
                                ) : (
                                    <CompactMemberCard member={member} idx={idx} currentLang={currentLang} />
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Visual indicator for scroll on mobile */}
                    <div className="md:hidden flex justify-center gap-2 mt-4">
                        <div className="h-1 w-8 bg-blue-600/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-600"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const LargeMemberCard: React.FC<{ member: Member; idx: number; currentLang: Language }> = ({ member, idx, currentLang }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="group px-4 md:px-0"
    >
        <div className="relative bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden premium-card group/card">
            {/* Photo */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/20 to-transparent" />

                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className={cn(
                        "text-white font-black text-base md:text-lg leading-tight mb-1",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>{member.name}</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <p className={cn(
                            "text-yellow-400 font-black text-[9px] md:text-[10px] tracking-[0.2em] uppercase",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}>{member.role}</p>
                    </div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4 w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] opacity-0 md:group-hover/card:opacity-100 transition-all duration-500 translate-y-2 group-hover/card:translate-y-0 z-20">
                    <Star size={16} className="text-white fill-white" />
                </div>
            </div>
        </div>
    </motion.div>
);

const CompactMemberCard: React.FC<{ member: Member; idx: number; currentLang: Language }> = ({ member, idx, currentLang }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="group"
    >
        <div className="relative bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-500 md:hover:-translate-y-2 shadow-[var(--shadow-premium)]">
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className={cn(
                        "text-white font-black text-sm md:text-base leading-tight line-clamp-1 mb-0.5",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>{member.name}</h3>
                    <p className={cn(
                        "text-yellow-400 font-black text-[8px] md:text-[9px] tracking-widest uppercase line-clamp-1",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>{member.role}</p>
                </div>
            </div>
        </div>
    </motion.div>
);

export default MembersSection;
