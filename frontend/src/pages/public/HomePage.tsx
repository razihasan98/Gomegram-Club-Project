import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  ChevronRight,
  MapPin,
  Flame,
  Play
} from 'lucide-react';
import api from '../../services/api';
import { ClubEvent, GalleryItem } from '../../types';
import { HeroSlider } from '../../components/public/HeroSlider';

export const HomePage: React.FC = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [completedEventCount, setCompletedEventCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, galleryRes, membersRes] = await Promise.all([
          api.get('/events'),
          api.get('/gallery'),
          api.get('/members'),
        ]);

        if (eventsRes.data?.events) {
          const allEvents: ClubEvent[] = eventsRes.data.events;

          setEvents(allEvents.slice(0, 3));

          const completedCount = allEvents.filter(
            (event) => event.status === 'completed',
          ).length;

          setCompletedEventCount(completedCount);
        }

        if (galleryRes.data?.gallery) {
          setGallery(galleryRes.data.gallery.slice(0, 6));
        }

        if (membersRes.data?.members) {
          setMemberCount(membersRes.data.members.length);
        }
      } catch (error) {
        console.error('Failed to load homepage data', error);
      }
    };

    fetchData();
  }, []);

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
    <div className="space-y-12 pb-20 md:space-y-20">
      {/* Hero Section */}
      <section className="relative w-full pt-2">
        <HeroSlider />
      </section>

      {/* Mission and Statistics */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-[#0B0F19] md:p-12">
          <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl dark:bg-indigo-500/10" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Mission */}
            <div className="space-y-6">
              <h2 className="font-bangla text-3xl font-bold leading-snug text-gray-900 dark:text-white md:text-4xl">
                একতা, প্রগতি ও সমাজ বিনির্মাণের লক্ষ্যে আমাদের পথচলা
              </h2>

              <p className="font-bangla text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘে আপনাকে স্বাগতম। আমরা
                বিশ্বাস করি তরুণদের মেধা, মনন ও ঐকান্তিক প্রচেষ্টাই পারে
                একটি সুন্দর ও আধুনিক সমাজ গড়ে তুলতে। আসুন, একসাথে
                স্বপ্নের পথে এগিয়ে যাই।
              </p>

              <div className="pt-2">
                <Link
                  to="/members"
                  className="inline-flex transform items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Users className="h-4 w-4" />

                  <span className="font-bangla">
                    আমাদের সদস্যবৃন্দ
                  </span>
                </Link>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="group flex h-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:bg-indigo-50 dark:border-gray-800 dark:bg-[#1A2140] dark:hover:bg-[#1f2747]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 transition-transform group-hover:scale-110 dark:bg-indigo-400/10">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                </div>

                <div className="mb-1 font-heading text-3xl font-black text-gray-900 dark:text-white">
                  {memberCount > 0 ? memberCount : '0'}
                </div>

                <div className="font-bangla text-sm font-semibold text-gray-500 dark:text-gray-400">
                  সক্রিয় সদস্য
                </div>
              </div>

              <div className="group flex h-full flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center transition-colors hover:bg-purple-50 dark:border-gray-800 dark:bg-[#1A2140] dark:hover:bg-[#1f2747]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 transition-transform group-hover:scale-110 dark:bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>

                <div className="mb-1 font-heading text-3xl font-black text-gray-900 dark:text-white">
                  {completedEventCount > 0
                    ? completedEventCount
                    : '0'}
                </div>

                <div className="font-bangla text-sm font-semibold text-gray-500 dark:text-gray-400">
                  সফল ইভেন্ট
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-[#F7F7FB]">
            Recent &amp; Upcoming Club Events
          </h2>

          {/* Spark Green View All Events Button */}
          <Link
            to="/events"
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#C6FF00]
              bg-[#C6FF00]
              px-5
              py-2.5
              text-sm
              font-bold
              text-black
              shadow-[0_6px_20px_rgba(198,255,0,0.30)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#B8F000]
              hover:shadow-[0_9px_28px_rgba(198,255,0,0.45)]
              active:scale-95
            "
          >
            <span>View All Events</span>

            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {events.map((event) => {
            let statusBadge = (
              <span className="inline-flex items-center rounded-full border border-violet-300/60 bg-violet-600/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(124,58,237,0.45)] backdrop-blur-md">
                Upcoming
              </span>
            );

            if (event.status === 'ongoing') {
              statusBadge = (
                <span className="inline-flex items-center rounded-full border border-orange-300/60 bg-orange-500/95 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(249,115,22,0.40)] backdrop-blur-md">
                  Ongoing
                </span>
              );
            } else if (event.status === 'completed') {
              statusBadge = (
                <span className="inline-flex items-center rounded-full border border-gray-300/50 bg-gray-900/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-md">
                  Completed
                </span>
              );
            }

            return (
              <div
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-800 dark:bg-black"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  {event.banner_image ? (
                    <img
                      src={event.banner_image}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-indigo-950/40 p-4 transition-transform duration-500 group-hover:scale-105">
                      <span className="line-clamp-3 break-words text-center text-2xl font-extrabold uppercase tracking-wider text-violet-600 opacity-80 dark:text-violet-300">
                        {event.title || 'Event'}
                      </span>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10" />

                  <div className="absolute right-3 top-3 z-10">
                    {statusBadge}
                  </div>
                </div>

                {/* Event Information */}
                <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
                  <div>
                    <h3 className="mb-2 line-clamp-1 font-heading text-lg font-bold text-gray-900 transition-colors group-hover:text-violet-600 dark:text-[#F7F7FB] dark:group-hover:text-violet-300">
                      {event.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-[#9CA6C1]">
                      {event.description ||
                        'Special club gathering and event.'}
                    </p>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-[#C5CCE0]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-500" />

                        <span>
                          {new Date(
                            event.event_date,
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-500" />

                        <span className="truncate">
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Spark Green Details Button */}
                  <Link
                    to="/events"
                    className="
                      group/button
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-[#C6FF00]
                      bg-[#C6FF00]
                      px-4
                      py-3
                      text-center
                      text-xs
                      font-bold
                      text-black
                      shadow-[0_6px_18px_rgba(198,255,0,0.22)]
                      transition-all
                      duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#B8F000]
                      hover:shadow-[0_8px_24px_rgba(198,255,0,0.38)]
                      active:scale-[0.97]
                    "
                  >
                    <span>View Details &amp; Fees</span>

                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-[#F7F7FB]">
            Club Photo Gallery
          </h2>

          <Link
            to="/gallery"
            className="group flex items-center gap-1 text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-cyan-300"
          >
            <span>View Full Gallery</span>

            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
            >
              <img
                src={getThumbnail(item)}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-md">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#080B16] via-[#080B16]/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-20">
                <span className="text-[10px] font-semibold uppercase text-violet-300">
                  {item.category}
                </span>

                <h4 className="line-clamp-1 font-heading text-sm font-bold text-white">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};