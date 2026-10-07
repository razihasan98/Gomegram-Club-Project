import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import HeroImage from '../../assets/hero.png';

interface SliderImage {
    id: number;
    image_path: string;
    title?: string;
    subtitle?: string;
}

export const HeroSlider: React.FC = () => {
    const [images, setImages] = useState<SliderImage[]>(() => {
        try {
            const cached = localStorage.getItem('slider_images');
            return cached && cached !== 'undefined' ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });
    const [intervalSec, setIntervalSec] = useState<number>(() => {
        try {
            const cached = localStorage.getItem('slider_interval');
            return cached ? parseInt(cached) : 5;
        } catch {
            return 5;
        }
    });
    const [currentIndex, setCurrentIndex] = useState(0);

    const getImageUrl = (path?: string) => {
        if (!path || path === 'local_hero') return HeroImage;
        if (path.startsWith('http')) return path;
        return path;
    };

    useEffect(() => {
        const fetchSliderData = async () => {
            try {
                const [sliderRes, settingsRes] = await Promise.all([
                    api.get('/slider').catch(() => ({ data: { images: [] } })),
                    api.get('/settings').catch(() => ({ data: { settings: {} } }))
                ]);
                
                if (sliderRes?.data?.images && Array.isArray(sliderRes.data.images)) {
                    setImages(sliderRes.data.images);
                    localStorage.setItem('slider_images', JSON.stringify(sliderRes.data.images));
                }
                
                if (settingsRes?.data?.settings?.slider_interval) {
                    const interval = parseInt(settingsRes.data.settings.slider_interval);
                    if (!isNaN(interval) && interval > 0) {
                        setIntervalSec(interval);
                        localStorage.setItem('slider_interval', interval.toString());
                    }
                }
            } catch (error) {
                console.error("Failed to fetch slider data", error);
            }
        };

        fetchSliderData();
    }, []);

    const isFirstRender = useRef(true);
    const displayImages: SliderImage[] = (images && Array.isArray(images) && images.length > 0) 
        ? images 
        : [{ id: -1, image_path: 'local_hero', title: '', subtitle: '' }];

    useEffect(() => {
        if (!displayImages || displayImages.length === 0) return;

        const timer = setInterval(() => {
            isFirstRender.current = false;
            setCurrentIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
        }, intervalSec * 1000);

        return () => clearInterval(timer);
    }, [displayImages.length, intervalSec]);

    const currentSlide = displayImages[currentIndex] || displayImages[0];

    return (
        <div className="relative w-full overflow-hidden bg-slate-950 aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[80vh] min-h-[300px]">
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
                    initial={{ opacity: isFirstRender.current ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                    {/* Full-width Edge-to-Edge Image with Natural 16:9 Aspect Ratio - Zero Side Gaps & Fully Visible */}
                    <img
                        src={getImageUrl(currentSlide?.image_path)}
                        alt={currentSlide?.title || "Club Activity"}
                        className="w-full h-full object-cover object-center select-none"
                        fetchPriority="high"
                        loading="eager"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== HeroImage) {
                                target.src = HeroImage;
                            }
                        }}
                    />

                    {/* Subtle bottom gradient for title clarity */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/15 to-transparent flex flex-col items-center justify-end pointer-events-none p-4 pb-6 sm:pb-8 md:pb-10 gap-1.5 sm:gap-2">
                        {currentSlide?.title && (
                            <motion.div 
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.04, delayChildren: 0.2 }
                                    }
                                }}
                                className="font-semibold text-xl sm:text-2xl md:text-3xl tracking-wider text-white/95 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                            >
                                {Array.from(currentSlide.title).map((char, index) => (
                                    <motion.span
                                        key={index}
                                        variants={{
                                            hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
                                            show: { 
                                                opacity: 1, 
                                                y: 0, 
                                                filter: 'blur(0px)',
                                                transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] } 
                                            }
                                        }}
                                        className="inline-block"
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}
                        {currentSlide?.subtitle && (
                            <motion.div 
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.03, delayChildren: 0.8 }
                                    }
                                }}
                                className="font-medium text-base sm:text-lg md:text-xl tracking-wide text-white text-center drop-shadow-md"
                            >
                                {Array.from(currentSlide.subtitle).map((char, index) => (
                                    <motion.span
                                        key={index}
                                        variants={{
                                            hidden: { opacity: 0, y: 15, filter: 'blur(8px)' },
                                            show: { 
                                                opacity: 1, 
                                                y: 0, 
                                                filter: 'blur(0px)',
                                                transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] } 
                                            }
                                        }}
                                        className="inline-block"
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
                    {displayImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`transition-all duration-300 rounded-full h-2 ${
                                currentIndex === idx 
                                    ? 'w-6 bg-indigo-500 shadow-sm' 
                                    : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
