import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Sparkles,
  Eye,
  FileText,
  ArrowLeft,
  User,
  Users,
  CalendarDays,
  WalletCards,
  CircleDollarSign
} from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { Member, ClubEvent } from '../../types';

export const MembersPage: React.FC = () => {
  const { formatBDT } = useClub();
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | string>('');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('id_asc');
  const [loading, setLoading] = useState<boolean>(true);

  // Selected member for detail modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberStatement, setMemberStatement] = useState<any | null>(null);

  // Fetch events list first
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        if (res.data?.events) {
          setEvents(res.data.events);
          if (res.data.events.length > 0) {
            setSelectedEventId(res.data.events[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching events', err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch members whenever filters change
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (search) params.search = search;
        if (statusFilter !== 'All') params.payment_status = statusFilter;
        if (typeFilter !== 'All') params.membership_type = typeFilter;
        if (selectedEventId) params.event_id = selectedEventId;
        if (sortBy) params.sort = sortBy;

        const res = await api.get('/members', { params });
        if (res.data?.members) {
          setMembers(res.data.members);
        }
      } catch (err) {
        console.error('Error fetching members', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [selectedEventId, search, statusFilter, typeFilter, sortBy]);

  // Open Member Details Modal and load statement
  const handleOpenMemberModal = async (member: Member) => {
    setSelectedMember(member);
    try {
      const res = await api.get(`/members/${member.id}/statement`);
      setMemberStatement(res.data);
    } catch {
      try {
        const adminRes = await api.get(`/admin/members/${member.id}/statement`);
        setMemberStatement(adminRes.data);
      } catch (err) {
        console.error('Error fetching member details', err);
      }
    }
  };

  // Aggregated Summary
  const summaryStats = useMemo(() => {
    let totalFees = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let totalPrevDue = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    members.forEach((m) => {
      const fin = m.financials;
      if (fin) {
        totalFees += Number(fin.event_fee || 0);
        totalPaid += Number(fin.paid || 0);
        totalDue += Number(fin.total_due || 0);
        totalPrevDue += Number(fin.previous_due || 0);

        if (fin.status === 'Paid') paidCount++;
        else if (fin.status === 'Partial') partialCount++;
        else unpaidCount++;
      }
    });

    return {
      totalFees,
      totalPaid,
      totalDue,
      totalPrevDue,
      paidCount,
      partialCount,
      unpaidCount,
      totalCount: members.length,
    };
  }, [members]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Page Header */}
      <div className="space-y-3">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-[#F7F7FB]">
          Members Directory
        </h1>
        <p className="text-gray-600 dark:text-[#C5B4AA] text-sm sm:text-base max-w-3xl">
          Search club members, view assigned event fees, recorded payments, and live calculated outstanding balances. Click on any member to view their complete financial ledger statement.
        </p>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/50 to-indigo-50/60 p-5 shadow-[0_10px_35px_rgba(14,165,233,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_18px_45px_rgba(14,165,233,0.16)] dark:border-sky-400/15 dark:from-[#08161D] dark:via-[#091922] dark:to-[#101A2B] dark:shadow-[0_12px_35px_rgba(0,0,0,0.24)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400" />
          <div className="mb-5 flex items-start justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#9BB4C1]">Total Members</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/80 text-sky-600 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Users className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="font-heading text-3xl font-black tracking-[-0.03em] text-sky-700 dark:text-[#7DD3FC]">{summaryStats.totalCount}</p>
          <p className="mt-1.5 text-[11px] font-medium text-slate-400 dark:text-[#6F8792]">Active member records</p>
        </div>

        <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/60 p-5 shadow-[0_10px_35px_rgba(245,158,11,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_18px_45px_rgba(245,158,11,0.15)] dark:border-amber-400/15 dark:from-[#19150C] dark:via-[#17150E] dark:to-[#211A10] dark:shadow-[0_12px_35px_rgba(0,0,0,0.24)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400" />
          <div className="mb-5 flex items-start justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#C1B498]">Total Event Fees</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-100/80 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-[#FFD166]">
              <CalendarDays className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="font-heading text-3xl font-black tracking-[-0.03em] text-amber-700 dark:text-[#FFD166]">{formatBDT(summaryStats.totalFees)}</p>
          <p className="mt-1.5 text-[11px] font-medium text-slate-400 dark:text-[#8F8066]">Selected event total</p>
        </div>

        <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/60 p-5 shadow-[0_10px_35px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_45px_rgba(16,185,129,0.15)] dark:border-emerald-400/15 dark:from-[#081A17] dark:via-[#091A18] dark:to-[#0B211E] dark:shadow-[0_12px_35px_rgba(0,0,0,0.24)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400" />
          <div className="mb-5 flex items-start justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#9ABBB1]">Total Collected</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100/80 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-[#55E6B1]">
              <WalletCards className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="font-heading text-3xl font-black tracking-[-0.03em] text-emerald-700 dark:text-[#55E6B1]">{formatBDT(summaryStats.totalPaid)}</p>
          <p className="mt-1.5 text-[11px] font-medium text-slate-400 dark:text-[#708D84]">Payments successfully cleared</p>
        </div>

        <div className="group relative min-h-[142px] overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-br from-white via-violet-50/50 to-fuchsia-50/50 p-5 shadow-[0_10px_35px_rgba(139,92,246,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_18px_45px_rgba(139,92,246,0.16)] dark:border-violet-400/15 dark:from-[#141125] dark:via-[#17122A] dark:to-[#21152D] dark:shadow-[0_12px_35px_rgba(0,0,0,0.24)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400" />
          <div className="mb-5 flex items-start justify-between gap-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-[#B5A7C6]">Total Due</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-200 bg-violet-100/80 text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-[#C4B5FD]">
              <CircleDollarSign className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="font-heading text-3xl font-black tracking-[-0.03em] text-violet-700 dark:text-[#C4B5FD]">{formatBDT(summaryStats.totalDue)}</p>
          <p className="mt-1.5 text-[11px] font-medium text-slate-400 dark:text-[#857493]">Outstanding across all events</p>
        </div>
      </div>

      {/* 3. Search, Event Selector, Filters & Sort Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-[0_0_20px_rgba(105,105,105,0.4)] hover:-translate-y-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* Event Selector */}
          <div className="md:col-span-3">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED] transition-colors"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED] transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Desktop Members Table & Mobile Card View */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-[#9CA6C1]">Loading member records and calculations...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">No Members Found</h3>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Please adjust your search keywords or filter criteria.</p>
        </div>
      ) : (
        <>
          {/* Members Table */}
          <div className="block overflow-hidden rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-[0_0_20px_rgba(105,105,105,0.4)] hover:-translate-y-1">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] table-fixed text-left font-sans text-sm text-gray-600 dark:text-[#C5CCE0]">
                <thead className="bg-gradient-to-r from-[#EEF2FF] via-[#F3F0FF] to-[#EDE9FE] text-[#373A72] dark:from-[#171A3A] dark:via-[#211A45] dark:to-[#17213F] dark:text-[#EEF2FF] uppercase font-extrabold text-[11px] tracking-[0.14em] border-y border-[#C7D2FE] dark:border-[#45457A] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <tr>
                    <th className="h-[54px] w-[5%] whitespace-nowrap px-4 text-center align-middle">Sl</th>
                    <th className="h-[54px] w-[20%] whitespace-nowrap px-4 text-left align-middle">Name</th>
                    <th className="h-[54px] w-[12%] whitespace-nowrap px-4 text-center align-middle">Blood Group</th>
                    <th className="h-[54px] w-[16%] whitespace-nowrap px-4 text-center align-middle">Phone</th>
                    <th className="h-[54px] w-[10%] whitespace-nowrap px-4 text-center align-middle">Paid</th>
                    <th className="h-[54px] w-[10%] whitespace-nowrap px-4 text-center align-middle">Event Due</th>
                    <th className="h-[54px] w-[10%] whitespace-nowrap px-4 text-center align-middle">Total Due</th>
                    <th className="h-[54px] w-[9%] whitespace-nowrap px-4 text-center align-middle">Status</th>
                    <th className="h-[54px] w-[8%] whitespace-nowrap pl-4 pr-6 text-center align-middle">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                  {members.map((member, index) => {
                    const fin = member.financials || {
                      event_fee: 0,
                      paid: 0,
                      previous_due: 0,
                      current_due: 0,
                      total_due: 0,
                      status: 'Paid',
                    };

                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    );

                    if (fin.status === 'Partial') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                          <Clock className="w-3 h-3" /> Partial
                        </span>
                      );
                    } else if (fin.status === 'Unpaid') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                          <AlertCircle className="w-3 h-3" /> Unpaid
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 dark:hover:bg-[#0D1224] dark:bg-[#0D1224] transition-colors group"
                      >
                        <td className="px-4 py-3.5 text-center font-mono text-[#8C766B]">{index + 1}</td>
                        <td className="px-4 py-3.5 text-left">
                          <div className="flex items-center gap-3">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-800"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-amber-700 dark:text-[#D4AF37] font-bold text-xs shrink-0">
                                {member.name ? member.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1]" />}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate bg-gradient-to-r from-[#E9FFF8] via-[#58E6BE] to-[#67C7F5] bg-clip-text text-base font-extrabold tracking-[-0.01em] text-transparent">
                                {member.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-[58px] items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[13px] font-extrabold tracking-[0.03em] text-rose-700 shadow-sm dark:border-[#FB7185]/25 dark:bg-[#FB7185]/10 dark:text-[#FDA4AF]">
                            {member.blood_group || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[13px] font-semibold tracking-[0.035em] text-slate-700 shadow-sm [font-variant-numeric:tabular-nums] dark:border-[#26434A] dark:bg-[#0B2025] dark:text-[#C7DBE0]">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-[#23C997]" />
                            {member.phone || 'Protected'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-[80px] items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 font-mono text-xs font-bold text-emerald-700 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-[#55E6B1]">
                            {formatBDT(fin.paid)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-[80px] items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-mono text-xs font-bold text-amber-700 shadow-sm dark:border-[#F4B942]/25 dark:bg-[#F4B942]/10 dark:text-[#FFD166]">
                            {formatBDT(fin.current_due)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex min-w-[84px] items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 font-mono text-[13px] font-extrabold text-violet-700 shadow-sm dark:border-[#A78BFA]/25 dark:bg-[#8B5CF6]/12 dark:text-[#C4B5FD]">
                            {formatBDT(fin.total_due)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">{statusBadge}</td>
                        <td className="py-3.5 pl-4 pr-6 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenMemberModal(member);
                            }}
                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-[#7C3AED] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-gray-600 dark:text-[#C5CCE0] transition-colors"
                            title="View Statement & History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

      {/* 5. Member Details & Printable Statement Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8 print-container">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 flex items-center justify-between no-print gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberStatement(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-700 dark:text-[#C5CCE0] hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800 dark:hover:border-[#3D4770] text-xs font-bold flex items-center gap-1.5 transition-all shadow-md group"
                  title="Back to Members & Dues"
                >
                  <ArrowLeft className="w-4 h-4 text-[#7C3AED] group-hover:-translate-x-1 transition-transform" />
                  <span>Back</span>
                </button>

                <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-amber-700 dark:text-[#D4AF37] font-bold font-mono">
                  {selectedMember.member_id || selectedMember.id}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 dark:text-[#F7F7FB]">{selectedMember.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">
                    {selectedMember.position || selectedMember.membership_type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberStatement(null);
                  }}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Body */}
            <div className="p-6 sm:p-8 space-y-6 text-gray-600 dark:text-[#C5CCE0]">
              {/* Official Printable Header */}
              <div className="text-center border-b border-gray-100 dark:border-gray-800 pb-6">
                <h2 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
                  Gomegram Swapnosiri Tarun Sangha
                </h2>
              </div>

              {/* Member Profile Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800 text-xs">
                <div>
                  <p className="text-gray-500 dark:text-[#9CA6C1]">Member Name:</p>
                  <p className="font-semibold text-gray-900 dark:text-[#F7F7FB] text-sm">{selectedMember.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#9CA6C1]">Member ID:</p>
                  <p className="font-semibold text-amber-700 dark:text-[#D4AF37] text-sm font-mono">{selectedMember.member_id || selectedMember.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#9CA6C1]">Membership Type:</p>
                  <p className="font-semibold text-gray-900 dark:text-[#F7F7FB]">{selectedMember.membership_type} {selectedMember.position ? `(${selectedMember.position})` : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-[#9CA6C1]">Phone:</p>
                  <p className="font-semibold text-gray-900 dark:text-[#F7F7FB] font-mono">{selectedMember.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Overall Balance Summary */}
              {memberStatement?.financial_summary && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                    <p className="text-[10px] sm:text-[11px] leading-tight text-gray-500 dark:text-[#9CA6C1] mb-1 break-words">Total Fees</p>
                    <p className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                      {formatBDT(memberStatement.financial_summary.total_fees_charged)}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-black border border-emerald-200 dark:border-emerald-500/30 flex flex-col justify-center">
                    <p className="text-[10px] sm:text-[11px] leading-tight text-emerald-700 dark:text-emerald-400 mb-1 break-words">Total Paid</p>
                    <p className="font-heading font-bold text-lg text-emerald-700 dark:text-emerald-400">
                      {formatBDT(memberStatement.financial_summary.total_amount_paid)}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-xl bg-white dark:bg-black border border-rose-200 dark:border-rose-500/30 flex flex-col justify-center">
                    <p className="text-[10px] sm:text-[11px] leading-tight text-rose-700 dark:text-rose-400 mb-1 break-words">Total Due</p>
                    <p className="font-heading font-bold text-lg text-rose-700 dark:text-rose-400">
                      {formatBDT(memberStatement.financial_summary.total_outstanding_due)}
                    </p>
                  </div>
                </div>
              )}

              {/* Event Ledger Breakdown */}
              {memberStatement?.event_ledger && memberStatement.event_ledger.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-[#F7F7FB]">Event-wise Ledger Breakdown:</h4>
                  <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] text-[10px] uppercase">
                        <tr>
                          <th className="p-2.5">Event Name</th>
                          <th className="p-2.5 text-right">Fee</th>
                          <th className="p-2.5 text-right">Paid</th>
                          <th className="p-2.5 text-right font-bold text-amber-700 dark:text-[#D4AF37]">Total Due</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                        {memberStatement.event_ledger.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140]">
                            <td className="p-2.5 font-medium text-gray-900 dark:text-[#F7F7FB]">{item.event_title}</td>
                            <td className="p-2.5 text-right">{formatBDT(item.event_fee)}</td>
                            <td className="p-2.5 text-right text-emerald-700 dark:text-emerald-400">{formatBDT(item.paid)}</td>
                            <td className="p-2.5 text-right font-bold text-amber-700 dark:text-[#D4AF37]">{formatBDT(item.total_due)}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  item.status === 'Paid'
                                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                    : item.status === 'Partial'
                                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                    : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bottom Back Button */}
              <div className="pt-6 flex items-center justify-center no-print border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setMemberStatement(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-700 dark:text-[#C5CCE0] hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800 dark:hover:border-[#3D4770] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <ArrowLeft className="w-4 h-4 text-[#7C3AED] group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Members & Dues</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
