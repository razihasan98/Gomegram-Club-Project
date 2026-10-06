import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  Users,
  Award,
  ShieldCheck,
  Target,
  Eye,
  Calendar,
  Phone,
  CheckCircle2,
  BookOpen,
  User
} from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { Member, Journey } from '../../types';

export const AboutPage: React.FC = () => {
  const { settings } = useClub();
  const [executiveMembers, setExecutiveMembers] = useState<Member[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loadingJourneys, setLoadingJourneys] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await api.get('/members');
        if (res.data?.members) {
          const leaders = res.data.members.filter((m: Member) => {
            if (m.status && m.status !== 'active') return false;
            const pos = (m.position || '').trim().toLowerCase();
            return pos !== '' && pos !== 'member' && pos !== 'general member' && pos !== 'general';
          });
          setExecutiveMembers(leaders);
        }
      } catch (err) {
        console.error('Error fetching leaders', err);
      }
    };
    const fetchJourneys = async () => {
      try {
        const res = await api.get('/journeys');
        setJourneys(res.data);
      } catch (err) {
        console.error('Error fetching journeys', err);
      } finally {
        setLoadingJourneys(false);
      }
    };

    fetchLeaders();
    fetchJourneys();
  }, []);

  // Hardcoded milestones removed in favor of dynamic API fetch
  return (
    <div className="space-y-20 pb-20 pt-8">

      {/* 4. Executive Leadership Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="font-heading font-bold text-3xl text-gray-900 dark:text-[#F7F7FB]">Club Leadership</h2>
          <p className="text-slate-400 text-sm">
            Meet the elected executive committee guiding the club's administration and events.
          </p>
        </div>

        {executiveMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {executiveMembers.map((leader) => (
              <div
                key={leader.id}
                className="rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-center hover:bg-gray-50 dark:hover:bg-black hover:shadow-[0_0_20px_rgba(105,105,105,0.4)] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {leader.photo ? (
                      <img
                        src={leader.photo}
                        alt={leader.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        className="w-full h-full rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl group-hover:scale-105 transition-transform">
                        {leader.name ? leader.name.charAt(0).toUpperCase() : <User className="w-8 h-8 text-gray-400 dark:text-slate-400" />}
                      </div>
                    )}

                  </div>

                  <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB] group-hover:text-emerald-400 transition-colors">
                    {leader.name}
                  </h3>
                  {leader.bangla_name && (
                    <p className="text-xs text-slate-400 mb-2">{leader.bangla_name}</p>
                  )}

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
                    {leader.position || leader.membership_type}
                  </span>

                  <p className="text-[11px] text-slate-500 font-mono">ID: {leader.member_id || leader.id}</p>
                </div>

                {leader.phone && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-[#1A2140] flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-[#9CA6C1]">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>{leader.phone}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-black shadow-sm border border-gray-100 dark:border-gray-800 text-center max-w-md mx-auto">
            <Users className="w-8 h-8 text-emerald-500/60 dark:text-emerald-400/60 mx-auto mb-2" />
            <p className="text-gray-900 dark:text-slate-300 font-medium text-sm">Executive committee list is being updated.</p>
            <p className="text-gray-500 dark:text-slate-500 text-xs mt-1">Officers and leadership positions will appear here once assigned.</p>
          </div>
        )}
      </section>

      {/* 5. Timeline & Milestones */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="font-heading font-bold text-3xl text-gray-900 dark:text-[#F7F7FB]">Our Proud Journey</h2>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 space-y-10 pl-6 md:pl-10">
          {loadingJourneys ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : journeys.length === 0 ? (
            <div className="text-slate-400 text-sm">Our journey milestones are being updated.</div>
          ) : (
            journeys.map((m, i) => (
              <div key={m.id || i} className="relative group">
                {/* Dot marker */}
                <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-5 h-5 rounded-full bg-slate-950 border-4 border-emerald-500 shadow-md group-hover:scale-125 transition-transform" />

                <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                  <span className="font-heading font-extrabold text-xl text-amber-400">{m.year}</span>
                  <h4 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">{m.title}</h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                  {m.description}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
