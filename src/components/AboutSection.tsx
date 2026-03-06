import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Landmark } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: 'easeOut' as const }
};

interface AboutSectionProps {
    currentLang: Language;
}

const AboutSection: React.FC<AboutSectionProps> = ({ currentLang }) => {
    const t = translations[currentLang];

    return (
        <section id="about" className="relative py-20 md:py-32 bg-blue-950 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={cn(
                            "inline-flex items-center gap-2 px-6 py-2 bg-yellow-500/10 rounded-full text-yellow-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-6 border border-yellow-500/20",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}
                    >
                        <Sparkles size={14} />
                        <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                            {t.about.badge}
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={cn(
                            "text-4xl md:text-6xl font-black text-white tracking-tighter",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}
                    >
                        AP-ARDA <span className="text-yellow-500">{currentLang === 'te' ? 'సంకల్పం' : t.about.resolution}</span>
                    </motion.h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto">
                    {/* Card 1: AP-ARDA Genesis */}
                    <motion.div
                        {...fadeInUp}
                        className="relative group p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-blue-900/50 to-blue-950/80 border border-yellow-500/20 shadow-2xl overflow-hidden backdrop-blur-sm"
                    >
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/10 rounded-[2rem] md:rounded-[3rem] m-2 md:m-4 pointer-events-none transition-all group-hover:border-yellow-500/30" />
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/5 rounded-[2rem] md:rounded-[3rem] m-4 md:m-6 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 bg-blue-950 rounded-full border border-yellow-500/30 flex items-center justify-center p-3 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all">
                                <img src="/image.png" alt="AP-ARDA Logo" className="w-full h-full object-contain" />
                            </div>

                            <div className={cn(
                                "space-y-3 mb-10 text-yellow-50 font-medium text-lg md:text-xl leading-relaxed",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>
                                {currentLang === 'te' ? (
                                    <>
                                        <p>ప్రతి ఉదయం ఒక కొత్త ఆశ...</p>
                                        <p>ప్రతి హృదయం ఒక స్వప్న లోకం...</p>
                                        <p className="text-yellow-400 font-bold mt-2">మన కలలను నిజం చేసే సమయం వచ్చేసింది!</p>
                                    </>
                                ) : (
                                    <p>{t.about.genesisMotto}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-500/50" />
                                <h3 className={cn(
                                    "text-2xl md:text-4xl font-black text-white flex items-center gap-3 tracking-wide",
                                    currentLang === 'te' ? "font-telugu underline underline-offset-8 decoration-yellow-500/30" : ""
                                )}>
                                    <Landmark className="text-yellow-500" size={32} />
                                    {t.about.genesis}
                                </h3>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-500/50" />
                            </div>

                            <div className={cn(
                                "space-y-4 text-blue-100/90 font-medium text-lg md:text-xl leading-relaxed mb-10",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>
                                <p>{t.about.genesisSubtitle}</p>
                                {t.about.genesisPoints.map((point, idx) => (
                                    <p key={idx}>{point}</p>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                    <Sparkles className="text-yellow-500" size={18} />
                                    <span className={cn(
                                        "text-yellow-400 font-bold tracking-wider flex items-center justify-center",
                                        currentLang === 'te' ? "font-telugu" : ""
                                    )}>
                                        <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                                            {t.about.genesisFooter}
                                        </span>
                                    </span>
                                    <Sparkles className="text-yellow-500" size={18} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: AP-ARDA Pledge */}
                    <motion.div
                        {...fadeInUp}
                        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                        className="relative group p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-blue-900/50 to-blue-950/80 border border-yellow-500/20 shadow-2xl overflow-hidden backdrop-blur-sm"
                    >
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/10 rounded-[2rem] md:rounded-[3rem] m-2 md:m-4 pointer-events-none transition-all group-hover:border-yellow-500/30" />
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/5 rounded-[2rem] md:rounded-[3rem] m-4 md:m-6 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 bg-blue-950 rounded-full border border-yellow-500/30 flex items-center justify-center p-3 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all">
                                <img src="/image.png" alt="AP-ARDA Logo" className="w-full h-full object-contain" />
                            </div>

                            <h3 className={cn(
                                "text-3xl md:text-4xl font-black text-yellow-500 mb-8 flex items-center gap-3 tracking-wide justify-center",
                                currentLang === 'te' ? "font-telugu underline underline-offset-8 decoration-white/10" : ""
                            )}>
                                {t.about.oathTitle}
                            </h3>

                            <div className={cn(
                                "space-y-5 text-blue-100/90 font-medium text-sm md:text-base leading-relaxed mb-10 text-justify md:text-center text-balance",
                                currentLang === 'te' ? "font-telugu px-2" : ""
                            )}>
                                <p>{t.about.oathText1}</p>
                                <p>{t.about.oathText2}</p>
                                <p>{t.about.oathText3}</p>
                                <p>{t.about.oathText4}</p>

                                <div className="pt-6 pb-4 space-y-2">
                                    <p className="text-lg md:text-xl text-yellow-500 font-bold">{t.about.oathFooter1}</p>
                                    <p className="text-lg md:text-xl text-yellow-500 font-bold">{t.about.oathFooter2}</p>
                                    <p className="text-xl md:text-2xl text-white font-black mt-4">{t.about.oathFinal}</p>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <p className="text-[10px] md:text-xs text-blue-300 font-bold uppercase tracking-[0.2em] opacity-80 max-w-[250px] mx-auto leading-relaxed">
                                    {t.about.orgName}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;

