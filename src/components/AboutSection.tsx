import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Landmark } from 'lucide-react';

const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: 'easeOut' as const }
};

const AboutSection: React.FC = () => {
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
                        className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-500/10 rounded-full text-yellow-500 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-6 border border-yellow-500/20"
                    >
                        <Sparkles size={14} />
                        Our Foundation & Pledge
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tighter"
                    >
                        AP-ARDA <span className="text-yellow-500">సంకల్పం</span>
                    </motion.h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 md:gap-16 max-w-7xl mx-auto">
                    {/* Card 1: AP-ARDA ఆవిర్భావం */}
                    <motion.div
                        {...fadeInUp}
                        className="relative group p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-blue-900/50 to-blue-950/80 border border-yellow-500/20 shadow-2xl overflow-hidden backdrop-blur-sm"
                    >
                        {/* Decorative rings matches the image design */}
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/10 rounded-[2rem] md:rounded-[3rem] m-2 md:m-4 pointer-events-none transition-all group-hover:border-yellow-500/30" />
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/5 rounded-[2rem] md:rounded-[3rem] m-4 md:m-6 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 bg-blue-950 rounded-full border border-yellow-500/30 flex items-center justify-center p-3 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all">
                                <img src="/image.png" alt="AP-ARDA Logo" className="w-full h-full object-contain" />
                            </div>

                            <div className="space-y-3 mb-10 text-yellow-50 font-medium text-lg md:text-xl leading-relaxed">
                                <p>ప్రతి ఉదయం ఒక కొత్త ఆశ...</p>
                                <p>ప్రతి హృదయం ఒక స్వప్న లోకం...</p>
                                <p className="text-yellow-400 font-bold mt-2">మన కలలను నిజం చేసే సమయం వచ్చేసింది!</p>
                            </div>

                            <div className="flex items-center justify-center gap-4 mb-8">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-500/50" />
                                <h3 className="text-2xl md:text-4xl font-black text-white flex items-center gap-3 tracking-wide">
                                    <Landmark className="text-yellow-500" size={32} />
                                    AP-ARDA ఆవిర్భావం
                                </h3>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-500/50" />
                            </div>

                            <div className="space-y-4 text-blue-100/90 font-medium text-lg md:text-xl leading-relaxed mb-10">
                                <p>భూమి - మన కలల సామ్రాజ్యం</p>
                                <p>రారాజుల్లా ఎదగాలి...</p>
                                <p>భూమితో స్వప్నాలు నిర్మించాలి...</p>
                                <p>భవిష్యత్తును భూమిపై చెక్కుకుందాం!</p>
                            </div>

                            <div className="mt-auto">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                    <Sparkles className="text-yellow-500" size={18} />
                                    <span className="text-yellow-400 font-bold tracking-wider">ఒక్కటై ముందుకు... అభివృద్ధి దిశగా!</span>
                                    <Sparkles className="text-yellow-500" size={18} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: AP-ARDA సంకల్ప ప్రతిజ్ఞ */}
                    <motion.div
                        {...fadeInUp}
                        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                        className="relative group p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-blue-900/50 to-blue-950/80 border border-yellow-500/20 shadow-2xl overflow-hidden backdrop-blur-sm"
                    >
                        {/* Decorative rings */}
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/10 rounded-[2rem] md:rounded-[3rem] m-2 md:m-4 pointer-events-none transition-all group-hover:border-yellow-500/30" />
                        <div className="absolute inset-x-0 inset-y-0 border-[1px] border-yellow-500/5 rounded-[2rem] md:rounded-[3rem] m-4 md:m-6 pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 bg-blue-950 rounded-full border border-yellow-500/30 flex items-center justify-center p-3 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] transition-all">
                                <img src="/image.png" alt="AP-ARDA Logo" className="w-full h-full object-contain" />
                            </div>

                            <h3 className="text-3xl md:text-4xl font-black text-yellow-500 mb-8 flex items-center gap-3 tracking-wide">
                                AP-ARDA సంకల్ప ప్రతిజ్ఞ
                            </h3>

                            <div className="space-y-5 text-blue-100/90 font-medium text-sm md:text-base leading-relaxed mb-10 text-justify md:text-center text-balance">
                                <p>
                                    మేము, AP-ARDA సభ్యులముగా, దేవుని సాక్షిగా మరియు సమాజాన్ని సాక్షిగా చేసుకుని, ఈ రోజు గంభీరంగా సంకల్పం చేస్తాము –
                                    <span className="text-white font-bold ml-1">రియల్ ఎస్టేట్ రంగాన్ని న్యాయబద్ధత, పారదర్శకత, నైతికతలతో</span> ముందుకు తీసుకువెళతామని.
                                </p>
                                <p>
                                    భూమిని కేవలం వ్యాపారంగా కాక, ప్రజల ఆశలు, వారి భవిష్యత్తు, వారి భద్రతగా భావిస్తామని. సమాజంలోని ప్రతి వర్గానికి సమాన అవకాశాలు కల్పించే విధంగా పనిచేస్తామని. <span className="text-yellow-400 font-bold">సోషల్ జస్టిస్‌ను మన మార్గదర్శకంగా స్వీకరిస్తామని.</span>
                                </p>
                                <p>
                                    అక్రమాలకు దూరంగా, ధర్మబద్ధంగా, బాధ్యతతో వ్యవహరిస్తామని. ప్రభుత్వ నిబంధనలను గౌరవిస్తూ, ప్రజల నమ్మకాన్ని కాపాడుతూ రంగ అభివృద్ధికి కృషి చేస్తామని.
                                </p>
                                <p>
                                    మన ఐక్యతను కాపాడుతూ, సభ్యుల గౌరవాన్ని నిలబెట్టుకుంటూ, AP-ARDA ప్రతిష్టను ఉన్నత శిఖరాలకు తీసుకెళతామని.
                                </p>

                                <div className="pt-6 pb-4 space-y-2">
                                    <p className="text-lg md:text-xl text-yellow-500 font-bold">మన లక్ష్యం - అభివృద్ధి. మన మార్గం - న్యాయం.</p>
                                    <p className="text-lg md:text-xl text-yellow-500 font-bold">మన ధ్యేయం - ప్రజల మేలు.</p>
                                    <p className="text-xl md:text-2xl text-white font-black mt-4">ఐక్యతే మన బలం - అభివృద్ధే మన లక్ష్యం.</p>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <p className="text-[10px] md:text-xs text-blue-300 font-bold uppercase tracking-[0.2em] opacity-80 max-w-[250px] mx-auto leading-relaxed">
                                    Andhra Pradesh Apex Real Estate Developers Association (Reg No 65/2026)
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
