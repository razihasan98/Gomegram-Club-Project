import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  Edit2,
  Trash2,
  Coins,
  MapPin,
  X,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import { useClub } from '../../context/ClubContext';
import { useToast } from '../../context/ToastContext';
import { ClubEvent } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';

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
  if (!dateStr) return '';
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

export const AdminEvents: React.FC = () => {
  const { formatBDT } = useClub();
  const { success, error } = useToast();

  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add / Edit Modal
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [eventDateDisplay, setEventDateDisplay] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner_image: '',
    event_date: '',
    start_time: '10:00 AM',
    location: '',
    event_fee: '',
    registration_deadline: '',
    status: 'upcoming',
    is_published: true,
    assign_to_all_active: false,
  });

  // Bulk Assign Fee Modal
  const [isBulkFeeOpen, setIsBulkFeeOpen] = useState<boolean>(false);
  const [bulkFeeEvent, setBulkFeeEvent] = useState<ClubEvent | null>(null);
  const [feeAmount, setFeeAmount] = useState<string>('2000');

  // Event Member Breakdown Modal
  const [detailEvent, setDetailEvent] = useState<any | null>(null);

  // Fetch Events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      if (res.data?.events) {
        setEvents(res.data.events);
      }
    } catch {
      error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '',
      description: '',
      banner_image: '',
      event_date: '',
      start_time: '10:00 AM',
      location: '',
      event_fee: '',
      registration_deadline: '',
      status: 'upcoming',
      is_published: true,
      assign_to_all_active: false,
    });
    setEventDateDisplay('');
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (evt: ClubEvent) => {
    setIsEditing(true);
    setCurrentId(evt.id);
    setFormData({
      title: evt.title,
      description: evt.description || '',
      banner_image: evt.banner_image || '',
      event_date: evt.event_date,
      start_time: evt.start_time || '',
      location: evt.location || '',
      event_fee: String(evt.event_fee),
      registration_deadline: evt.registration_deadline || '',
      status: evt.status,
      is_published: evt.is_published ?? true,
      assign_to_all_active: false,
    });
    setEventDateDisplay(formatISOToDMY(evt.event_date));
    setIsAddEditOpen(true);
  };

  // Save Event
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const isoDate = parseDateToISO(eventDateDisplay || formData.event_date);
    if (!formData.title || !isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      error('Please provide event title and valid date (dd/mm/yyyy).');
      return;
    }

    try {
      const payload = {
        ...formData,
        event_date: isoDate,
        event_fee: 0,
      };

      if (isEditing && currentId) {
        await api.put(`/admin/events/${currentId}`, payload);
        success('Event updated successfully.');
      } else {
        await api.post('/admin/events', payload);
        success('Event created and fee configured.');
      }
      setIsAddEditOpen(false);
      fetchEvents();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save event.');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? Member records and transactions linked to this event will be affected.')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      success('Event deleted.');
      fetchEvents();
    } catch {
      error('Failed to delete event.');
    }
  };

  // Open Member Breakdown Modal
  const handleOpenDetail = async (evt: ClubEvent) => {
    try {
      const res = await api.get(`/admin/events/${evt.id}`);
      setDetailEvent(res.data);
    } catch {
      error('Failed to load event member breakdown.');
    }
  };

  // Submit Bulk Fee Allocation
  const handleBulkAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFeeEvent) return;

    try {
      const res = await api.post(`/admin/events/${bulkFeeEvent.id}/assign-fee`, {
        fee_amount: Number(feeAmount),
        all_active: true,
      });

      success(`Assigned ৳${feeAmount} fee to ${res.data.assigned_count} members.`);
      setIsBulkFeeOpen(false);
      fetchEvents();
    } catch {
      error('Failed to allocate bulk fees.');
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Events
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
            Create club events, set participant fees, and track contributions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* 2. Events Grid */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col justify-between hover:border-[#8B5CF6]/40 transition-colors shadow-xl"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  {evt.banner_image ? (
                    <img
                      src={evt.banner_image}
                      alt={evt.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#7C3AED]/20 to-[#240F06]/40 flex items-center justify-center p-4">
                      <span className="text-2xl font-extrabold text-[#7C3AED] opacity-70 uppercase tracking-wider text-center break-words line-clamp-3">
                        {evt.title || 'Event'}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-black/85 dark:bg-black/85 text-[#D4AF37] border border-gray-200 dark:border-gray-800">
                      {evt.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB] line-clamp-1">{evt.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-[#9CA6C1] line-clamp-2">{evt.description}</p>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-[#C5CCE0] pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span>{new Date(evt.event_date).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black/50 flex items-center gap-3">
                <button
                  onClick={() => handleOpenEdit(evt)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-[#7C3AED] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-gray-600 dark:text-[#C5CCE0] flex items-center justify-center gap-2 transition-all font-semibold text-xs"
                  title="Edit Event"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteEvent(evt.id)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-rose-600 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-rose-400 flex items-center justify-center gap-2 transition-all font-semibold text-xs"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Add / Edit Event Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                {isEditing ? 'Edit Event Information' : 'Create New Event'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter event title"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Event Date *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="DD/MM/YYYY"
                      value={eventDateDisplay}
                      onChange={(e) => {
                        setEventDateDisplay(e.target.value);
                        const parsed = parseDateToISO(e.target.value);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
                          setFormData((prev) => ({ ...prev, event_date: parsed }));
                        }
                      }}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] font-mono placeholder-gray-400 focus:outline-none focus:border-[#7C3AED]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#1A2140] text-[#D4AF37] cursor-pointer transition-colors overflow-hidden">
                      <Calendar className="w-4 h-4 pointer-events-none" />
                      <input
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData((prev) => ({ ...prev, event_date: e.target.value }));
                            setEventDateDisplay(formatISOToDMY(e.target.value));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Click to choose from calendar"
                      />
                    </div>
                  </div>
                </div>


              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter location"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                value={formData.banner_image}
                onChange={(newImg) => setFormData({ ...formData, banner_image: newImg })}
                folder="events"
                label="Event Banner Image"
                placeholderText="Choose Photo"
              />

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event schedule, festivities, and details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] text-xs font-semibold shadow shadow-slate-900/20"
                >
                  {isEditing ? 'Save Updates' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Event Member Breakdown Detail Modal */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                  {detailEvent.event.title} - Member Payment Breakdown
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Date: {detailEvent.event.event_date}</p>
              </div>
              <button
                onClick={() => setDetailEvent(null)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs text-gray-600 dark:text-[#C5CCE0]">
                  <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] text-[11px] uppercase border-b border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Member Name</th>
                      <th className="p-3 text-right">Fee</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right font-bold text-[#D4AF37]">Total Due</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                    {detailEvent.member_payments.map((m: any) => (
                      <tr key={m.member_id} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140]">
                        <td className="p-3 font-mono font-bold text-[#D4AF37]">{m.member_id || m.member_code}</td>
                        <td className="p-3 font-semibold text-gray-900 dark:text-[#F7F7FB]">{m.member_name}</td>
                        <td className="p-3 text-right">{formatBDT(m.event_fee)}</td>
                        <td className="p-3 text-right text-emerald-400 font-semibold">{formatBDT(m.paid)}</td>
                        <td className="p-3 text-right text-[#D4AF37] font-bold">{formatBDT(m.total_due)}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              m.status === 'Paid'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : m.status === 'Partial'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
