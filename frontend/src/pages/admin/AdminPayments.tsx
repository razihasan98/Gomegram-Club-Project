import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  Trash2,
  X,
  AlertCircle,
  ChevronDown,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { useToast } from '../../context/ToastContext';
import { Member, ClubEvent, PaymentTransaction } from '../../types';

// Helper to format ISO YYYY-MM-DD to DD/MM/YYYY
const formatISOToDMY = (isoStr: string): string => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoStr;
};

// Helper to parse DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
const parseDateToISO = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const clean = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const parts = clean.split(/[\/\-.]/);
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = `20${year}`;
    if (year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return clean;
};

export const AdminPayments: React.FC = () => {
  const { formatBDT } = useClub();
  const { success, error } = useToast();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Single Payment Modal
  const [isSingleOpen, setIsSingleOpen] = useState<boolean>(false);
  const [memberSearchTerm, setMemberSearchTerm] = useState<string>('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState<boolean>(false);
  const [eventSearchTerm, setEventSearchTerm] = useState<string>('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState<boolean>(false);
  const [memberLedger, setMemberLedger] = useState<any[]>([]);

  const [paymentDateDisplay, setPaymentDateDisplay] = useState<string>('');

  const [singleForm, setSingleForm] = useState({
    member_id: '',
    event_id: '',
    amount: '',
    payment_method: 'Cash',
    payment_date: '',
    transaction_reference: '',
    received_by: 'Treasurer',
    note: '',
  });

  // Fetch Transactions List
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;

      const res = await api.get('/admin/payments', { params });
      const txData = Array.isArray(res.data?.transactions)
        ? res.data.transactions
        : res.data?.transactions?.data || [];
      setTransactions(txData);
    } catch {
      error('Failed to load transaction ledger');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Aux Data (Members, Events)
  const fetchAuxData = async () => {
    try {
      const [mRes, eRes] = await Promise.all([
        api.get('/admin/members'),
        api.get('/admin/events'),
      ]);
      setMembers(mRes.data?.members || []);
      setEvents(eRes.data?.events || []);
    } catch {
      console.error('Failed to load aux data');
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search]);

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    if (singleForm.member_id) {
      api.get(`/admin/members/${singleForm.member_id}/statement`).then(res => {
        setMemberLedger(res.data.event_ledger || []);
      }).catch(err => {
        console.error('Failed to fetch member ledger', err);
        setMemberLedger([]);
      });
    } else {
      setMemberLedger([]);
    }
  }, [singleForm.member_id]);

  // Open Single Payment Modal
  const handleOpenSingle = (member?: Member) => {
    fetchAuxData();
    setSingleForm({
      member_id: member ? String(member.id) : '',
      event_id: '',
      amount: '',
      payment_method: 'Cash',
      payment_date: '',
      transaction_reference: '',
      received_by: 'Treasurer',
      note: '',
    });
    setMemberLedger([]);
    setPaymentDateDisplay('');
    setMemberSearchTerm(member ? `ID: ${member.member_id || member.id} - ${member.name}` : '');
    setEventSearchTerm('');
    setIsMemberDropdownOpen(false);
    setIsEventDropdownOpen(false);
    setIsSingleOpen(true);
  };

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

  // Submit Single Payment
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.member_id || !singleForm.amount || Number(singleForm.amount) <= 0) {
      error('Please select a member and enter a valid payment amount.');
      return;
    }

    const isoDate = parseDateToISO(paymentDateDisplay || singleForm.payment_date);

    try {
      await api.post('/admin/payments', {
        member_id: Number(singleForm.member_id),
        event_id: singleForm.event_id ? Number(singleForm.event_id) : null,
        amount: Number(singleForm.amount),
        payment_method: singleForm.payment_method || 'Cash',
        payment_date: isoDate,
        transaction_reference: singleForm.transaction_reference,
        received_by: singleForm.received_by,
        note: singleForm.note,
      });

      success('Payment recorded successfully!');
      setIsSingleOpen(false);
      fetchTransactions();
      fetchAuxData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  // Delete Transaction
  const handleDeleteTx = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment record? Balance will be adjusted.')) return;
    try {
      await api.delete(`/admin/payments/${id}`);
      success('Payment transaction deleted.');
      fetchTransactions();
      fetchAuxData();
    } catch {
      error('Failed to delete transaction.');
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Payments & Transaction Ledger
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
            Record member contributions and manage payment transaction records.
          </p>
        </div>

        <div>
          <button
            onClick={() => handleOpenSingle()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 2. Search Box */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by member name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* 3. Transactions Table */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Loading payment ledger...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB]">No Payments Recorded</h3>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Click 'Record Payment' to add a contribution.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-[#C5CCE0]">
              <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] uppercase text-[11px] tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Member</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5 text-right font-bold text-emerald-400">Amount Paid</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                {(Array.isArray(transactions) ? transactions : []).map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140] transition-colors">
                    <td className="p-3.5 font-mono text-[#D4AF37] font-bold">
                      {tx.member?.member_id || tx.member?.id || tx.member_id}
                    </td>
                    <td className="p-3.5 font-semibold text-gray-900 dark:text-[#F7F7FB]">
                      {tx.member?.name || 'Member'}
                    </td>
                    <td className="p-3.5 text-gray-500 dark:text-[#9CA6C1]">
                      {tx.event?.title || 'General Fund'}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400 text-sm">
                      {formatBDT(tx.amount)}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-gray-500 dark:text-[#9CA6C1]">
                      {new Date(tx.payment_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-rose-600 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-rose-400 transition-colors"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Streamlined Record Single Payment Modal */}
      {isSingleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-visible my-8">
            <div className="p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">Record Member Payment</h3>
              <button
                onClick={() => setIsSingleOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSingle} className="p-6 space-y-4">
              {/* Searchable Member Input */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Select Member *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Click to select or search member..."
                    value={memberSearchTerm}
                    onChange={(e) => {
                      setMemberSearchTerm(e.target.value);
                      setIsMemberDropdownOpen(true);
                      if (!e.target.value) {
                        setSingleForm((prev) => ({ ...prev, member_id: '' }));
                      }
                    }}
                    onClick={() => {
                      fetchAuxData();
                      setIsMemberDropdownOpen((prev) => !prev);
                      setIsEventDropdownOpen(false);
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  />
                  {memberSearchTerm ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberSearchTerm('');
                        setSingleForm((prev) => ({ ...prev, member_id: '' }));
                        setIsMemberDropdownOpen(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>

                {isMemberDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-black border border-[#7C3AED]/30 ring-1 ring-[#7C3AED]/20 shadow-2xl z-50 divide-y divide-gray-100 dark:divide-[#2C355D]">
                    {filteredMembers.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-500 dark:text-[#9CA6C1]">No matching members found</div>
                    ) : (
                      filteredMembers.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSingleForm((prev) => ({ ...prev, member_id: String(m.id) }));
                            setMemberSearchTerm(`ID: ${m.member_id || m.id} - ${m.name}`);
                            setIsMemberDropdownOpen(false);
                          }}
                          className={`px-3.5 py-2.5 hover:bg-[#7C3AED]/15 hover:text-[#D4AF37] cursor-pointer text-xs flex items-center justify-between transition-colors ${
                            singleForm.member_id === String(m.id) ? 'bg-[#7C3AED]/20 text-[#D4AF37] font-semibold' : 'text-gray-600 dark:text-[#C5CCE0]'
                          }`}
                        >
                          <span>ID: {m.member_id || m.id} - {m.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Searchable Event Input */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Event / Purpose
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Click to select or search event / purpose..."
                    value={eventSearchTerm}
                    onChange={(e) => {
                      setEventSearchTerm(e.target.value);
                      setIsEventDropdownOpen(true);
                      if (!e.target.value) {
                        setSingleForm((prev) => ({ ...prev, event_id: '' }));
                      }
                    }}
                    onClick={() => {
                      fetchAuxData();
                      setIsEventDropdownOpen((prev) => !prev);
                      setIsMemberDropdownOpen(false);
                    }}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  />
                  {eventSearchTerm ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventSearchTerm('');
                        setSingleForm((prev) => ({ ...prev, event_id: '' }));
                        setIsEventDropdownOpen(true);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>

                {isEventDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-black border border-[#7C3AED]/30 ring-1 ring-[#7C3AED]/20 shadow-2xl z-50 divide-y divide-gray-100 dark:divide-[#2C355D]">
                    <div
                      onClick={() => {
                        setSingleForm((prev) => ({ ...prev, event_id: '' }));
                        setEventSearchTerm('General Fund / No Event');
                        setIsEventDropdownOpen(false);
                      }}
                      className="px-3.5 py-2.5 hover:bg-[#7C3AED]/15 hover:text-[#D4AF37] cursor-pointer text-xs text-gray-500 dark:text-[#9CA6C1] transition-colors"
                    >
                      General Fund / No Event
                    </div>
                    {filteredEvents.map((evt) => {
                      const ledgerEntry = memberLedger.find((l: any) => l.event_id === evt.id);
                      const displayFee = ledgerEntry ? ledgerEntry.event_fee : evt.event_fee;
                      return (
                      <div
                        key={evt.id}
                        onClick={() => {
                          setSingleForm((prev) => ({ ...prev, event_id: String(evt.id) }));
                          setEventSearchTerm(`${evt.title} (৳${displayFee})`);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`px-3.5 py-2.5 hover:bg-[#7C3AED]/15 hover:text-[#D4AF37] cursor-pointer text-xs flex items-center justify-between transition-colors ${
                          singleForm.event_id === String(evt.id) ? 'bg-[#7C3AED]/20 text-[#D4AF37] font-semibold' : 'text-gray-600 dark:text-[#C5CCE0]'
                        }`}
                      >
                        <span>{evt.title}</span>
                        <span className="text-[#D4AF37] font-mono">(৳{displayFee})</span>
                      </div>
                    )})}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Payment Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter amount..."
                    value={singleForm.amount}
                    onChange={(e) => setSingleForm({ ...singleForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-emerald-400 font-bold focus:outline-none focus:border-[#7C3AED] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Payment Date *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="DD/MM/YYYY"
                      value={paymentDateDisplay}
                      onChange={(e) => {
                        setPaymentDateDisplay(e.target.value);
                        const parsed = parseDateToISO(e.target.value);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
                          setSingleForm((prev) => ({ ...prev, payment_date: parsed }));
                        }
                      }}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] font-mono placeholder-gray-400 focus:outline-none focus:border-[#7C3AED]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#1A2140] text-[#D4AF37] cursor-pointer transition-colors overflow-hidden">
                      <Calendar className="w-4 h-4 pointer-events-none" />
                      <input
                        type="date"
                        value={singleForm.payment_date}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSingleForm((prev) => ({ ...prev, payment_date: e.target.value }));
                            setPaymentDateDisplay(formatISOToDMY(e.target.value));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Click to choose from calendar"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSingleOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] text-xs font-semibold shadow shadow-slate-900/20"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
