import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { useToast } from '../../context/ToastContext';
import { ClubEvent, Member } from '../../types';

export const AdminReports: React.FC = () => {
  const { formatBDT } = useClub();
  const { error } = useToast();

  const [activeReportTab, setActiveReportTab] = useState<'payments' | 'statement'>('payments');
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('All');
  const [eventSearchTerm, setEventSearchTerm] = useState<string>('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memberSearchTerm, setMemberSearchTerm] = useState<string>('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState<boolean>(false);

  // Report Data
  const [reportData, setReportData] = useState<any | null>(null);
  const [memberStatement, setMemberStatement] = useState<any | null>(null);

  // Fetch initial dropdown items
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [evtRes, memRes] = await Promise.all([
          api.get('/admin/events'),
          api.get('/admin/members'),
        ]);
        if (evtRes.data?.events) {
          setEvents(evtRes.data.events);
        }
        if (memRes.data?.members) {
          setMembers(memRes.data.members);
        }
      } catch {
        error('Failed to load metadata');
      }
    };
    fetchMetadata();
  }, []);

  const filteredMembers = members.filter((m) => {
    if (!memberSearchTerm) return true;
    const term = memberSearchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      String(m.id).includes(term) ||
      (m.member_id && m.member_id.toLowerCase().includes(term))
    );
  });

  const filteredEvents = events.filter((evt) => {
    if (!eventSearchTerm) return true;
    const term = eventSearchTerm.toLowerCase();
    return evt.title.toLowerCase().includes(term);
  });

  // Fetch Report based on active tab
  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (activeReportTab === 'payments') {
          const res = await api.get('/admin/reports/member-payments', {
            params: {
              event_id: selectedEventId !== 'All' ? selectedEventId : undefined,
              status: statusFilter !== 'All' ? statusFilter : undefined,
            },
          });
          setReportData(res.data);
        } else if (activeReportTab === 'statement' && selectedMemberId) {
          const res = await api.get(`/admin/members/${selectedMemberId}/statement`);
          setMemberStatement(res.data);
        }
      } catch {
        error('Failed to generate report');
      }
    };

    fetchReport();
  }, [activeReportTab, selectedEventId, statusFilter, selectedMemberId]);

  return (
    <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Financial Reports & Statements
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
            Generate event-wise member payment sheets and individual printable member audit ledgers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 no-print">
        <button
          onClick={() => setActiveReportTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReportTab === 'payments'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-md shadow-slate-900/20'
              : 'bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] border border-gray-200 dark:border-gray-800'
          }`}
        >
          Event Payment Sheet
        </button>

        <button
          onClick={() => setActiveReportTab('statement')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReportTab === 'statement'
              ? 'bg-[#0F172A] text-white dark:bg-white dark:text-[#0F172A] shadow-md shadow-slate-900/20'
              : 'bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] border border-gray-200 dark:border-gray-800'
          }`}
        >
          Individual Member Ledger
        </button>
      </div>

      {/* Filter Row for Reports */}
      {activeReportTab === 'payments' ? (
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4 no-print">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#C5CCE0]">
            <span className="font-semibold whitespace-nowrap">Event:</span>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Enter event name"
                value={eventSearchTerm}
                onChange={(e) => {
                  setEventSearchTerm(e.target.value);
                  setIsEventDropdownOpen(true);
                  if (!e.target.value) {
                    setSelectedEventId('All');
                  }
                }}
                onClick={() => setIsEventDropdownOpen((prev) => !prev)}
                className="w-full pl-3.5 pr-8 py-1.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              />
              {eventSearchTerm ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventSearchTerm('');
                    setSelectedEventId('All');
                    setIsEventDropdownOpen(true);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-[#9CA6C1] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}

              {isEventDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-2xl z-50 divide-y divide-gray-100 dark:divide-[#2C355D]">
                  <div
                    onClick={() => {
                      setSelectedEventId('All');
                      setEventSearchTerm('');
                      setIsEventDropdownOpen(false);
                    }}
                    className={`px-3.5 py-2 hover:bg-[#7C3AED]/15 hover:text-[#D4AF37] cursor-pointer text-xs transition-colors ${
                      selectedEventId === 'All' ? 'bg-[#7C3AED]/20 text-[#D4AF37] font-semibold' : 'text-gray-500 dark:text-[#9CA6C1]'
                    }`}
                  >
                    All Events
                  </div>
                  {filteredEvents.length === 0 ? (
                    <div className="p-2.5 text-center text-xs text-gray-500 dark:text-[#9CA6C1]">No events found</div>
                  ) : (
                    filteredEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setSelectedEventId(String(evt.id));
                          setEventSearchTerm(evt.title);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`px-3.5 py-2 hover:bg-[#7C3AED]/15 hover:text-[#D4AF37] cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          selectedEventId === String(evt.id) ? 'bg-[#7C3AED]/20 text-[#D4AF37] font-semibold' : 'text-gray-600 dark:text-[#C5CCE0]'
                        }`}
                      >
                        <span>{evt.title}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#C5CCE0]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB]"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-[#C5CCE0] font-semibold whitespace-nowrap">Select Member:</span>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Enter id and name"
                value={memberSearchTerm}
                onChange={(e) => {
                  setMemberSearchTerm(e.target.value);
                  setIsMemberDropdownOpen(true);
                  if (!e.target.value) {
                    setSelectedMemberId('');
                    setMemberStatement(null);
                  }
                }}
                onClick={() => setIsMemberDropdownOpen((prev) => !prev)}
                className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              />
              {memberSearchTerm ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMemberSearchTerm('');
                    setSelectedMemberId('');
                    setMemberStatement(null);
                    setIsMemberDropdownOpen(true);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}

              {isMemberDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-2xl z-50 divide-y divide-gray-100 dark:divide-[#2C355D]">
                  {filteredMembers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500 dark:text-[#9CA6C1]">No matching members found</div>
                  ) : (
                    filteredMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMemberId(String(m.id));
                          setMemberSearchTerm(`ID: ${m.member_id || m.id} - ${m.name}`);
                          setIsMemberDropdownOpen(false);
                        }}
                        className={`px-3.5 py-2 hover:bg-[#7C3AED]/15 hover:text-[#D4AF37] cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          selectedMemberId === String(m.id) ? 'bg-[#7C3AED]/20 text-[#D4AF37] font-semibold' : 'text-gray-600 dark:text-[#C5CCE0]'
                        }`}
                      >
                        <span>ID: {m.member_id || m.id} - {m.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Content Container (Printable) */}
      <div className="p-8 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-2xl print-container space-y-6">
        {/* Printable Official Club Letterhead */}
        <div className="text-center border-b border-gray-100 dark:border-gray-800 pb-6">
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Gomegram Swapnosiri Tarun Sangha
          </h2>
          <p className="text-[#D4AF37] text-sm">গোমগ্রাম স্বপ্নসিঁড়ি তরুণ সংঘ</p>
          <p className="inline-block mt-3 px-3 py-1 rounded bg-white dark:bg-black text-[#D4AF37] font-bold text-xs uppercase tracking-wider border border-gray-200 dark:border-gray-800">
            {activeReportTab === 'payments'
              ? 'EVENT COLLECTION & MEMBER PAYMENT REPORT'
              : 'INDIVIDUAL MEMBER STATEMENT & FINANCIAL LEDGER'}
          </p>
        </div>

        {/* 1. Member Payment Report Table */}
        {activeReportTab === 'payments' && reportData?.report_data && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left text-xs text-gray-600 dark:text-[#C5CCE0]">
                <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Member Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-right">Event Fee</th>
                    <th className="p-3 text-right">Paid</th>
                    <th className="p-3 text-right">Event Due</th>
                    <th className="p-3 text-right font-bold text-[#D4AF37]">Total Due</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                  {reportData.report_data.map((row: any, index: number) => (
                    <tr key={row.id || row.member_id || index} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140]">
                      <td className="p-3 font-mono font-bold text-[#D4AF37]">{row.member_id || row.id || index + 1}</td>
                      <td className="p-3 font-semibold text-gray-900 dark:text-[#F7F7FB]">{row.name}</td>
                      <td className="p-3 text-gray-500 dark:text-[#9CA6C1] font-mono text-[11px]">{row.phone || 'Ã¢â‚¬â€'}</td>
                      <td className="p-3 text-right">{formatBDT(row.event_fee)}</td>
                      <td className="p-3 text-right font-semibold text-emerald-400">{formatBDT(row.paid)}</td>
                      <td className="p-3 text-right text-amber-400">{formatBDT(row.current_due ?? Math.max(0, row.event_fee - row.paid))}</td>
                      <td className="p-3 text-right font-bold text-[#D4AF37]">{formatBDT(row.total_due)}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : row.status === 'Partial'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. Individual Member Statement */}
        {activeReportTab === 'statement' && memberStatement && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800 text-xs">
              <div>
                <p className="text-gray-500 dark:text-[#9CA6C1]">Member Name:</p>
                <p className="font-semibold text-gray-900 dark:text-[#F7F7FB] text-sm">{memberStatement.member?.name}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-[#9CA6C1]">Member ID:</p>
                <p className="font-semibold text-[#D4AF37] text-sm font-mono">{memberStatement.member?.member_id || memberStatement.member?.id}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-[#9CA6C1]">Membership Type:</p>
                <p className="font-semibold text-gray-900 dark:text-[#F7F7FB]">{memberStatement.member?.membership_type} ({memberStatement.member?.position || 'Member'})</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-[#9CA6C1]">Phone:</p>
                <p className="font-semibold text-gray-900 dark:text-[#F7F7FB] font-mono">{memberStatement.member?.phone || 'N/A'}</p>
              </div>
            </div>

            {memberStatement.financial_summary && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                  <p className="text-[11px] text-gray-500 dark:text-[#9CA6C1]">Total Fees Charged</p>
                  <p className="font-bold text-base text-gray-900 dark:text-[#F7F7FB]">{formatBDT(memberStatement.financial_summary.total_fees_charged)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-black border border-emerald-500/30">
                  <p className="text-[11px] text-emerald-400">Total Paid</p>
                  <p className="font-bold text-base text-emerald-400">{formatBDT(memberStatement.financial_summary.total_amount_paid)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-black border border-rose-500/30">
                  <p className="text-[11px] text-rose-400">Total Due</p>
                  <p className="font-bold text-base text-rose-400">{formatBDT(memberStatement.financial_summary.total_outstanding_due)}</p>
                </div>
              </div>
            )}

            {/* Event Ledger Breakdown */}
            {memberStatement.event_ledger && memberStatement.event_ledger.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs text-gray-900 dark:text-[#F7F7FB] uppercase tracking-wider">Event Fees & Dues Breakdown:</h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-left text-xs text-gray-600 dark:text-[#C5CCE0]">
                    <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] text-[10px] uppercase border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="p-2.5">Event</th>
                        <th className="p-2.5 text-right">Fee</th>
                        <th className="p-2.5 text-right">Paid</th>
                        <th className="p-2.5 text-right font-bold text-[#D4AF37]">Total Due</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                      {memberStatement.event_ledger.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140]">
                          <td className="p-2.5 font-medium text-gray-900 dark:text-[#F7F7FB]">{item.event_title}</td>
                          <td className="p-2.5 text-right">{formatBDT(item.event_fee)}</td>
                          <td className="p-2.5 text-right text-emerald-400">{formatBDT(item.paid)}</td>
                          <td className="p-2.5 text-right font-bold text-[#D4AF37]">{formatBDT(item.total_due)}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                item.status === 'Paid'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : item.status === 'Partial'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
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
          </div>
        )}


      </div>
    </div>
  );
};
