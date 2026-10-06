import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { ClubEvent } from '../../types';

export const EventsPage: React.FC = () => {
  const { formatBDT } = useClub();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        if (res.data?.events) {
          setEvents(res.data.events);
        }
      } catch (err) {
        console.error('Error fetching events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (activeTab === 'all') return true;
    return evt.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-[#F7F7FB]">
          Club Events & Festivals
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Browse all upcoming, ongoing, and completed socio-cultural celebrations, sports tournaments, and community programs.
        </p>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all duration-300 ${
              activeTab === tab
                ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/25 dark:bg-slate-300 dark:text-slate-900 dark:shadow-slate-300/25'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-slate-700 dark:bg-black dark:text-[#9CA6C1] dark:border-gray-800 dark:hover:bg-[#1A2341] dark:hover:text-[#F7F7FB]'
            }`}
          >
            {tab === 'all' ? 'All Events' : tab === 'upcoming' ? 'Upcoming' : tab === 'ongoing' ? 'Ongoing' : 'Completed'}
          </button>
        ))}
      </div>

      {/* 3. Event Cards Grid */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading events list...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">No Events Found</h3>
          <p className="text-xs text-slate-400">Try selecting a different tab filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => {
            let statusBadge = (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Upcoming
              </span>
            );
            if (evt.status === 'ongoing') {
              statusBadge = (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Ongoing
                </span>
              );
            } else if (evt.status === 'completed') {
              statusBadge = (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600">
                  Completed
                </span>
              );
            }

            return (
              <div
                key={evt.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-56 overflow-hidden">
                  {evt.banner_image ? (
                    <img
                      src={evt.banner_image}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-700 p-4">
                      <span className="text-3xl font-extrabold text-emerald-400 opacity-70 uppercase tracking-wider text-center break-words line-clamp-3">
                        {evt.title || 'Event'}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">{statusBadge}</div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-[#F7F7FB] group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.description || 'Special club gathering and festive event.'}
                    </p>

                    <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Date: {new Date(evt.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {evt.start_time && (
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Time: {evt.start_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">Venue: {evt.location}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEvent(evt)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-emerald-600 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-slate-200 border border-slate-700/80 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>View Event Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="relative h-64 overflow-hidden">
              {selectedEvent.banner_image ? (
                <img
                  src={selectedEvent.banner_image}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center p-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 opacity-50 uppercase tracking-wider text-center break-words line-clamp-2">
                    {selectedEvent.title || 'Event'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-gray-900 dark:text-[#F7F7FB] hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {selectedEvent.status}
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB] mt-2">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-sm text-slate-300">
              <p className="text-base leading-relaxed text-slate-200">
                {selectedEvent.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-500">Date & Time:</p>
                  <p className="font-semibold text-gray-900 dark:text-[#F7F7FB]">
                    {new Date(selectedEvent.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {selectedEvent.start_time && ` (${selectedEvent.start_time})`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Location / Venue:</p>
                  <p className="font-semibold text-gray-900 dark:text-[#F7F7FB]">{selectedEvent.location}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
