import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Coins,
  AlertCircle,
  TrendingUp,
  Receipt,
  Printer,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { DashboardStats, PaymentTransaction } from '../../types';

export const DashboardOverview: React.FC = () => {
  const { formatBDT } = useClub();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentTransaction | null>(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-12 text-center">
        <div className="w-10 h-10 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500 dark:text-[#9CA6C1]">Loading admin dashboard analytics...</p>
      </div>
    );
  }

  const { kpis, recent_transactions } = stats;
  const duesList = stats.dues_alert || stats.top_due_members || [];

  return (
    <div className="space-y-8 pb-10 text-gray-900 dark:text-[#F7F7FB]">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 dark:text-[#F7F7FB]">
            Admin Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#9CA6C1] mt-1">
            Real-time accounting, live member dues, and transaction ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/events"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-[#0D1224] dark:bg-[#0D1224] text-gray-600 dark:text-[#C5CCE0] border border-gray-200 dark:border-gray-800 flex items-center gap-1.5 transition-all"
          >
            <Coins className="w-4 h-4 text-[#D4AF37]" />
            <span>Manage Events & Fees</span>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-[#9CA6C1]">Total Members</span>
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#D4AF37]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-gray-900 dark:text-[#F7F7FB]">{kpis.total_members}</p>
        </div>

        {/* Total Collected */}
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-emerald-400">Total Collected</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-emerald-400">
            {formatBDT(kpis.total_collected)}
          </p>
        </div>

        {/* Total Due */}
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-rose-400">Outstanding Dues</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-3xl text-rose-400">
            {formatBDT(kpis.total_due)}
          </p>
        </div>

        {/* Ongoing / Upcoming Event */}
        <div className="p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:border-[#8B5CF6]/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#D4AF37]">
              {kpis.event_card_title || (kpis.latest_event?.status === 'ongoing' ? 'Ongoing Event' : 'Upcoming Event')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-[#D4AF37]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading font-extrabold text-base sm:text-lg text-gray-900 dark:text-[#F7F7FB] leading-snug break-words">
            {kpis.latest_event?.title || 'No Active Events'}
          </p>
        </div>
      </div>

      {/* 3. Bottom Grid: Top Dues Alert & Recent Transactions Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Dues Alert List */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB]">Top Outstanding Dues</h3>
            </div>
            <Link to="/admin/reports" className="text-xs text-[#D4AF37] hover:underline">
              View All Dues
            </Link>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {duesList.map((item: any) => (
              <div
                key={item.id || item.member_id}
                className="p-3 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs hover:border-[#8B5CF6]/40 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-[#F7F7FB]">{item.name}</p>
                  <p className="text-[11px] text-[#D4AF37] font-mono">{item.phone || 'No Phone'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-rose-400 text-sm">{formatBDT(item.total_due)}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Stream */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB]">Recent Payment Transactions</h3>
            </div>
            <Link to="/admin/payments" className="text-xs text-[#D4AF37] hover:underline">
              Open Payment Ledger
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-[#C5CCE0]">
              <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] text-[11px] uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-3">SL</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Event</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                {(recent_transactions || []).map((tx, index) => (
                  <tr key={tx.id} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140] transition-colors">
                    <td className="p-3 font-mono text-[#D4AF37] font-bold">
                      {index + 1}
                    </td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-[#F7F7FB]">
                      {tx.member?.name || 'Member'}
                    </td>
                    <td className="p-3 text-gray-500 dark:text-[#9CA6C1] truncate max-w-[140px]">
                      {tx.event?.title || 'General'}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {formatBDT(tx.amount)}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-gray-500 dark:text-[#9CA6C1]">
                      {new Date(tx.payment_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="p-1 rounded bg-gray-100 dark:bg-[#1A2140] hover:bg-[#7C3AED] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-gray-600 dark:text-[#C5CCE0] transition-colors"
                        title="Print Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Printable Transaction Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-6 shadow-2xl print-container">
            <div className="flex items-center justify-between no-print border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="font-heading font-bold text-sm text-[#D4AF37]">Payment Money Receipt</span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Receipt Letterhead */}
            <div className="text-center border-b border-gray-100 dark:border-gray-800 pb-4">
              <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-[#F7F7FB]">
                Gomegram Swapnosiri Tarun Sangha
              </h3>
              <p className="text-xs text-[#D4AF37]">Official Money Receipt</p>
              <p className="text-[10px] text-gray-500 dark:text-[#9CA6C1] mt-0.5">Helpline: +880 1712-345678</p>
            </div>

            <div className="space-y-2.5 text-xs text-gray-600 dark:text-[#C5CCE0]">
              <div className="flex justify-between">
                <span className="text-[#8C766B]">Receipt No:</span>
                <span className="font-mono text-[#D4AF37] font-bold">RCP-2026-{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C766B]">Member ID:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-[#F7F7FB]">{selectedReceipt.member?.id || selectedReceipt.member_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C766B]">Member Name:</span>
                <span className="font-semibold text-gray-900 dark:text-[#F7F7FB]">{selectedReceipt.member?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C766B]">Event:</span>
                <span className="text-gray-900 dark:text-[#F7F7FB]">{selectedReceipt.event?.title || 'General Event'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C766B]">Payment Date:</span>
                <span className="font-mono text-gray-900 dark:text-[#F7F7FB]">{new Date(selectedReceipt.payment_date).toLocaleDateString('en-GB')}</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm pt-2">
                <span className="font-bold text-gray-900 dark:text-[#F7F7FB]">Amount Paid:</span>
                <span className="font-heading font-extrabold text-emerald-400 text-lg">
                  {formatBDT(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end text-[10px] text-gray-500 dark:text-[#9CA6C1]">
              <div>
                <p>Received By: {selectedReceipt.received_by || 'Treasurer'}</p>
                <p>Status: Verified & Logged</p>
              </div>
              <div className="text-center">
                <div className="h-6" />
                <p className="border-t border-gray-200 dark:border-gray-800 pt-1">Authorized Signature</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
