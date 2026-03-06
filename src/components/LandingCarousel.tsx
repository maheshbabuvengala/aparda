import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MousePointer2, Sparkles } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

interface CarouselImage {
    id: string;
    url: string;
    title?: string;
    description?: string;
}

interface LandingCarouselProps {
    currentLang: Language;
}

const LandingCarousel: React.FC<LandingCarouselProps> = ({ currentLang }) => {
    const t = translations[currentLang];
    const [images, setImages] = useState<CarouselImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'carousel'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const imageList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CarouselImage[];
            setImages(imageList);
            setLoading(false);
        }, (error) => {
            console.error('LandingCarousel Error:', error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [images.length]);

    if (loading || images.length === 0) return (
        <div className="h-screen bg-blue-950 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
        </div>
    );

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    const currentImage = images[currentIndex];
    const displayTitle = currentImage.title || t.hero.titleDefault;
    const displayDescription = currentImage.description || t.hero.descriptionDefault;

    return (
        <div className="relative h-screen overflow-hidden bg-blue-950">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentImage.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    <img
                        src={currentImage.url}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-blue-950/20 to-blue-950/90" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <span className={cn(
                                "inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 backdrop-blur-md border border-white/10 rounded-full text-blue-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>
                                <Sparkles size={12} className="text-yellow-400" />
                                <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                                    {t.hero.tagline}
                                </span>
                            </span>
                            <h2
                                className={cn(
                                    "text-4xl md:text-8xl font-black text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter drop-shadow-2xl",
                                    currentLang === 'te' ? "font-telugu" : ""
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: displayTitle.replace(/Andhra Pradesh/g, `<span class="text-yellow-400">Andhra Pradesh</span>`)
                                        .replace(/ఆంధ్రప్రదేశ్/g, `<span class="text-yellow-400">ఆంధ్రప్రదేశ్</span>`)
                                }}
                            />
                            <p className={cn(
                                "text-base md:text-2xl text-blue-100/80 font-medium max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed drop-shadow-lg px-4 md:px-0",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>
                                {displayDescription}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' })}
                                    className={cn(
                                        "w-full sm:w-auto px-10 py-4 md:py-5 bg-white text-blue-950 rounded-xl md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-widest shadow-2xl hover:bg-yellow-400 transition-colors flex items-center justify-center",
                                        currentLang === 'te' ? "font-telugu" : ""
                                    )}
                                >
                                    <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                                        {t.hero.explore}
                                    </span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => document.getElementById('activities')?.scrollIntoView({ behavior: 'smooth' })}
                                    className={cn(
                                        "w-full sm:w-auto px-10 py-4 md:py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl md:rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center",
                                        currentLang === 'te' ? "font-telugu" : ""
                                    )}
                                >
                                    <span className={currentLang === 'te' ? "telugu-nudge-down" : ""}>
                                        {t.hero.learnMore}
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
                <div className="hidden md:block">
                    <button
                        onClick={prevSlide}
                        className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all z-20 group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all z-20 group"
                    >
                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {/* Progress Indicators */}
            <div className="absolute bottom-10 md:bottom-12 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 flex gap-3 md:gap-4 z-20">
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1 md:h-1.5 transition-all duration-500 rounded-full ${idx === currentIndex ? "w-8 md:w-16 bg-yellow-400" : "w-3 md:w-4 bg-white/20 hover:bg-white/40"
                            }`}
                    />
                ))}
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="hidden md:flex absolute bottom-12 right-12 flex-col items-center gap-4 z-20"
            >
                <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white/50 to-white/20" />
                <span className={cn(
                    "[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.5em] text-white/40",
                    currentLang === 'te' ? "font-telugu" : ""
                )}>
                    {t.hero.scrollDown}
                </span>
                <MousePointer2 size={12} className="text-yellow-400 animate-bounce" />
            </motion.div>
        </div>
    );
};

export default LandingCarousel;
