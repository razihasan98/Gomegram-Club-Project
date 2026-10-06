import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play
} from 'lucide-react';
import api from '../../services/api';
import { GalleryItem } from '../../types';

export const GalleryPage: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [categories] = useState<string[]>([
    'All',

    'Cultural Program',
    'Social Activities',
    'Other',
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        const res = await api.get('/gallery', { params });
        if (res.data?.gallery) {
          setGallery(res.data.gallery);
        }
      } catch (err) {
        console.error('Failed to load gallery items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [selectedCategory]);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % gallery.length);
    }
  };

  const getThumbnail = (item: GalleryItem) => {
    if (item.type === 'video') {
      const match = item.image_path.match(/embed\/([^?]+)/) || item.image_path.match(/v=([^&]+)/);
      const videoId = match ? match[1] : null;
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1000&q=80';
    }
    return item.image_path;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-[#F7F7FB]">
          Photo Gallery & Memories
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Capturing unforgettable moments from our annual festivals, picnic get-togethers, sports tournaments, and relief initiatives.
        </p>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/25 dark:bg-slate-300 dark:text-slate-900 dark:shadow-slate-300/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-slate-700 dark:bg-black dark:text-[#9CA6C1] dark:border-gray-800 dark:hover:bg-[#1A2341] dark:hover:text-[#F7F7FB]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Masonry / Image Grid */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading photo album...</p>
        </div>
      ) : gallery.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">No Photos Found</h3>
          <p className="text-xs text-slate-400">No photos uploaded under this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleOpenLightbox(index)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 shadow-xl cursor-pointer transition-all duration-300"
            >
              <img
                src={getThumbnail(item)}
                alt={item.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-md">
                    <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end z-20">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="font-heading font-bold text-white text-sm line-clamp-1 mt-0.5">
                  {item.title}
                </h4>
                {item.caption && (
                  <p className="text-[11px] text-slate-300 line-clamp-1 mt-1">
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Fullscreen Lightbox Preview */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-800/80 text-gray-900 dark:text-[#F7F7FB] hover:bg-rose-600 transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-slate-800/80 text-gray-900 dark:text-[#F7F7FB] hover:bg-emerald-600 transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-slate-800/80 text-gray-900 dark:text-[#F7F7FB] hover:bg-emerald-600 transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {gallery[lightboxIndex].type === 'video' ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                {gallery[lightboxIndex].image_path.includes('youtube.com') || gallery[lightboxIndex].image_path.includes('youtu.be') ? (
                  <iframe
                    src={gallery[lightboxIndex].image_path}
                    title={gallery[lightboxIndex].title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={gallery[lightboxIndex].image_path}
                    title={gallery[lightboxIndex].title}
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay
                  ></video>
                )}
              </div>
            ) : (
              <img
                src={gallery[lightboxIndex].image_path}
                alt={gallery[lightboxIndex].title}
                className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl border border-slate-800"
              />
            )}
            <div className="text-center mt-4 space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {gallery[lightboxIndex].category}
              </span>
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                {gallery[lightboxIndex].title}
              </h3>
              {gallery[lightboxIndex].caption && (
                <p className="text-xs text-slate-400 max-w-xl">
                  {gallery[lightboxIndex].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
