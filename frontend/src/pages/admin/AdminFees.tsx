import React, { useState, useEffect } from 'react';
import { Save, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ClubEvent } from '../../types';

interface MemberFeeInput {
  member_id: number;
  member_code: string;
  member_name: string;
  photo?: string;
  phone: string;
  event_fee: string;
}

export const AdminFees: React.FC = () => {
  const { success, error } = useToast();
  
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');
  
  const [members, setMembers] = useState<MemberFeeInput[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all events for the dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/admin/events');
        if (res.data?.events) {
          setEvents(res.data.events);
        }
      } catch (err) {
        error('Failed to load events.');
      }
    };
    fetchEvents();
  }, [error]);

  // Fetch members and their fees for the selected event
  useEffect(() => {
    if (!selectedEventId) {
      setMembers([]);
      return;
    }

    const fetchEventMembers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/admin/events/${selectedEventId}`);
        if (res.data?.member_payments) {
          const formattedMembers = res.data.member_payments.map((m: any) => ({
            member_id: m.member_id,
            member_code: m.member_code || String(m.member_id),
            member_name: m.member_name,
            photo: m.photo || '',
            phone: m.phone || '',
            event_fee: String(m.event_fee || 0),
          }));
          setMembers(formattedMembers);
        }
      } catch (err) {
        error('Failed to load member fee data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventMembers();
  }, [selectedEventId, error]);

  // Handle individual fee change
  const handleFeeChange = (memberId: number, value: string) => {
    setMembers(prev => prev.map(m => 
      m.member_id === memberId ? { ...m, event_fee: value } : m
    ));
  };

  // Submit all fees
  const handleSaveAll = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    try {
      const payload = {
        fees: members.map(m => ({
          member_id: m.member_id,
          event_fee: Number(m.event_fee) || 0,
        }))
      };
      
      const res = await api.put(`/admin/events/${selectedEventId}/individual-fees`, payload);
      success(res.data.message || 'Fees successfully updated!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save fees.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Event Fees
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
            Assign or update event fees for all members quickly in a single view.
          </p>
        </div>
        
        {members.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-2 shadow-lg shadow-slate-900/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Fees'}</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-2">Select Event to Manage Fees</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(Number(e.target.value) || '')}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED] cursor-pointer"
            >
              <option value="">-- Choose an Event --</option>
              {events.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.title} ({evt.status})</option>
              ))}
            </select>
          </div>
          
          {selectedEventId && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-2">Search Member</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#9CA6C1]" />
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Loading members...</p>
        </div>
      ) : selectedEventId && members.length > 0 ? (
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-[#C5CCE0]">
              <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] text-[11px] uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-semibold w-24">ID</th>
                  <th className="px-6 py-4 font-semibold">Member Name</th>
                  <th className="px-6 py-4 font-semibold text-center w-48">Contribution Fee (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                {filteredMembers.map((member) => (
                  <tr key={member.member_id} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#D4AF37]">
                      {member.member_code}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#F7F7FB]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 flex-shrink-0">
                          {member.photo ? (
                            <img 
                              src={member.photo} 
                              alt={member.member_name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold text-[#D4AF37] ${member.photo ? 'hidden' : ''}`}>
                            {member.member_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <span>{member.member_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="0"
                          value={member.event_fee}
                          onChange={(e) => handleFeeChange(member.member_id, e.target.value)}
                          className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-sm font-bold text-[#D4AF37] focus:outline-none focus:border-[#7C3AED] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-[#9CA6C1] italic">
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedEventId && !loading ? (
         <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
           <p className="text-sm text-gray-500 dark:text-[#9CA6C1]">No active members found.</p>
         </div>
      ) : null}
    </div>
  );
};
