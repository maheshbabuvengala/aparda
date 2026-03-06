import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { Language, translations } from '../utils/translations';
import { cn } from '../utils/cn';

interface GalleryImage {
    id: string;
    url: string;
}

interface GallerySectionProps {
    currentLang: Language;
}

const GallerySection: React.FC<GallerySectionProps> = ({ currentLang }) => {
    const t = translations[currentLang];
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = window.innerWidth > 768 ? 400 : 250;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(12));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const imageList = snapshot.docs.map(doc => ({
                id: doc.id,
                url: doc.data().url
            })) as GalleryImage[];
            setImages(imageList);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading || images.length === 0) return null;

    return (
        <section className="py-12 md:py-20 bg-white overflow-hidden relative">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-12 md:mb-16">
                    <div className="relative inline-block">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-center gap-3 mb-6"
                        >
                            <div className="w-10 h-[2px] bg-blue-600 rounded-full" />
                            <span className={cn(
                                "text-blue-600 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>{t.gallery.badge}</span>
                        </motion.div>
                        <h2 className={cn(
                            "text-4xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none",
                            currentLang === 'te' ? "font-telugu" : ""
                        )}>
                            {t.gallery.title.split(' ').length > 1 ? (
                                <>
                                    {t.gallery.title.split(' ').slice(0, -1).join(' ')} <span className="text-blue-600">{t.gallery.title.split(' ').slice(-1)}</span>
                                </>
                            ) : (
                                t.gallery.title
                            )}
                        </h2>
                    </div>
                    <p className={cn(
                        "text-gray-500 max-w-xl mx-auto text-base md:text-lg font-medium leading-relaxed mt-8",
                        currentLang === 'te' ? "font-telugu" : ""
                    )}>
                        {t.gallery.description}
                    </p>
                    <div className="h-1.5 w-24 bg-blue-600 mx-auto mt-8 rounded-full" />
                </div>

                <div className="relative group/slider">
                    {/* Navigation Buttons */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 bg-white/90 backdrop-blur-md text-blue-600 rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(0,0,0,0.15)] border border-gray-100 hover:bg-blue-50 hover:scale-110 transition-all"
                    >
                        <ChevronLeft size={24} className="md:w-7 md:h-7" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-14 md:h-14 bg-white/90 backdrop-blur-md text-blue-600 rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(0,0,0,0.15)] border border-gray-100 hover:bg-blue-50 hover:scale-110 transition-all"
                    >
                        <ChevronRight size={24} className="md:w-7 md:h-7" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 md:gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory py-4 md:py-8 px-2 md:px-4 items-center scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                    >
                        {images.map((img, idx) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="group relative w-[220px] sm:w-[260px] md:w-[320px] aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-50 cursor-pointer shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-950/20 transition-all duration-700 snap-center shrink-0"
                                onClick={() => setSelectedImage(img.url)}
                            >
                                <img
                                    src={img.url}
                                    alt="Gallery item"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-md translate-y-4 group-hover:translate-y-0">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-white backdrop-blur-xl group-hover:scale-110 transition-transform duration-500">
                                        <Maximize2 size={24} className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 translate-y-2 group-hover:translate-y-0">
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white",
                                        currentLang === 'te' ? "font-telugu" : ""
                                    )}>
                                        <ImageIcon size={10} />
                                        {t.gallery.card.view}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-blue-950/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-20"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-10 right-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all shadow-2xl"
                        >
                            <X size={32} />
                        </motion.button>

                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative max-w-6xl max-h-full"
                        >
                            <img
                                src={selectedImage}
                                className="max-h-[85vh] rounded-[3rem] object-contain shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10"
                                alt="Gallery View"
                            />
                            <div className={cn(
                                "absolute -bottom-16 left-1/2 -translate-x-1/2 text-center text-white/40 text-[10px] font-black uppercase tracking-[0.5em] whitespace-nowrap",
                                currentLang === 'te' ? "font-telugu" : ""
                            )}>
                                {t.gallery.lightbox.documentation}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default GallerySection;
