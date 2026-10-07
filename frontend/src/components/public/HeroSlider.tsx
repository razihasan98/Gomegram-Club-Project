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
        <div className="relative w-full bg-slate-950 overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentIndex}
                    className="w-full flex items-center justify-center relative overflow-hidden"
                    initial={{ opacity: isFirstRender.current ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {/* Ambient Background - Fills left and right side gaps with matching vibrant photo colors */}
                    <img
                        src={getImageUrl(currentSlide?.image_path)}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-65 brightness-75 select-none pointer-events-none"
                    />

                    {/* Dark gradient overlay for smooth visual blending */}
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" />

                    {/* 100% Full Uncropped Sharp Main Image */}
                    <img
                        src={getImageUrl(currentSlide?.image_path)}
                        alt={currentSlide?.title || "Club Activity"}
                        className="relative z-10 w-full h-auto max-h-[85vh] min-h-[240px] sm:min-h-[320px] object-contain block select-none mx-auto drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
                        fetchPriority="high"
                        loading="eager"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== HeroImage) {
                                target.src = HeroImage;
                            }
                        }}
                    />

                    {/* Title overlay positioned at bottom */}
                    {currentSlide?.title && (
                        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col items-center justify-end pointer-events-none p-4 pb-4 sm:pb-6 md:pb-8">
                            <h3 className="font-semibold text-lg sm:text-2xl md:text-3xl text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-4xl px-4">
                                {currentSlide.title}
                            </h3>
                            {currentSlide?.subtitle && (
                                <p className="font-medium text-sm sm:text-base md:text-lg text-white/90 text-center drop-shadow-md mt-1">
                                    {currentSlide.subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            {displayImages.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm">
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
