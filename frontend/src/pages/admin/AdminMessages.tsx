import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Clock,
  Trash2,
  CheckCircle,
  Reply,
  Inbox
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ContactMessage } from '../../types';

export const AdminMessages: React.FC = () => {
  const { success, error } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/messages', {
        params: { unread_only: unreadOnly ? '1' : '0' },
      });
      if (res.data?.messages?.data) {
        setMessages(res.data.messages.data);
      }
      setUnreadCount(res.data?.unread_count || 0);
    } catch {
      error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [unreadOnly]);

  const handleToggleRead = async (id: number, currentReadStatus: boolean) => {
    try {
      await api.patch(`/admin/messages/${id}/read`, {
        is_read: !currentReadStatus,
      });
      fetchMessages();
    } catch {
      error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this inquiry message?')) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      success('Message deleted.');
      fetchMessages();
    } catch {
      error('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Messages & Public Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Read and reply to feedback, questions, and donation inquiries submitted through the website contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>Unread Messages Only ({unreadCount})</span>
          </label>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB]">Inbox is Empty</h3>
          <p className="text-xs text-slate-400">No contact messages received currently.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl border transition-colors ${
                !msg.is_read
                  ? 'bg-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      !msg.is_read
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {msg.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-gray-900 dark:text-[#F7F7FB] text-sm">{msg.name}</h4>
                      {!msg.is_read && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" /> {msg.email}
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {msg.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.created_at).toLocaleString('en-GB')}</span>
                </div>
              </div>

              {msg.subject && (
                <p className="font-semibold text-xs text-amber-400 pt-3">
                  Subject: {msg.subject}
                </p>
              )}

              <p className="text-xs text-slate-300 leading-relaxed pt-2">
                {msg.message}
              </p>

              <div className="pt-4 mt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => handleToggleRead(msg.id, msg.is_read)}
                  className="text-slate-400 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{msg.is_read ? 'Mark as Unread' : 'Mark as Read'}</span>
                </button>

                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Swapnosiri Club Inquiry')}`}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] flex items-center gap-1 transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
