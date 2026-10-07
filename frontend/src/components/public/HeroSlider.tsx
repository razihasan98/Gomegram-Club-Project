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
        <div className="relative w-full rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800/40 flex items-center justify-center h-[340px] sm:h-[440px] md:h-[500px] lg:h-[540px] bg-slate-950">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentIndex}
                    className="absolute inset-0 w-full h-full overflow-hidden"
                    initial={{ opacity: isFirstRender.current ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    {/* Full Container Photo Display */}
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

                    {/* Title overlay with letter-by-letter animation */}
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col items-center justify-end pointer-events-none p-4 pb-5 sm:pb-7 md:pb-9 gap-1 sm:gap-1.5">
                        {currentSlide?.title && (
                            <motion.div 
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.035, delayChildren: 0.15 }
                                    }
                                }}
                                className="font-semibold text-lg sm:text-2xl md:text-3xl tracking-wider text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-4xl px-4"
                            >
                                {Array.from(currentSlide.title).map((char, index) => (
                                    <motion.span
                                        key={index}
                                        variants={{
                                            hidden: { opacity: 0, y: 15, filter: 'blur(6px)' },
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
                        {currentSlide?.subtitle && (
                            <motion.div 
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.025, delayChildren: 0.6 }
                                    }
                                }}
                                className="font-medium text-sm sm:text-base md:text-lg text-white/95 text-center drop-shadow-md"
                            >
                                {Array.from(currentSlide.subtitle).map((char, index) => (
                                    <motion.span
                                        key={index}
                                        variants={{
                                            hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
                                            show: { 
                                                opacity: 1, 
                                                y: 0, 
                                                filter: 'blur(0px)',
                                                transition: { duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] } 
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
        </div>
    );
};
