import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  User
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Member } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';

export const AdminMembers: React.FC = () => {
  const { success, error } = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    membership_type: 'General',
    position: 'Member',
    blood_group: '',
    photo: '',
    previous_due: '0',
    status: 'active',
  });

  // Delete Confirmation Modal
  const [deleteConfirmMember, setDeleteConfirmMember] = useState<Member | null>(null);

  // Fetch Members List
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;

      const res = await api.get('/admin/members', { params });
      if (res.data?.members) {
        setMembers(res.data.members);
      }
    } catch {
      error('Failed to load members list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  // Open Add Member Modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentMemberId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      membership_type: 'General',
      position: 'Member',
      blood_group: '',
      photo: '',
      previous_due: '0',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  // Open Edit Member Modal
  const handleOpenEdit = (member: Member) => {
    setIsEditing(true);
    setCurrentMemberId(member.id);
    setFormData({
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      membership_type: member.membership_type || 'General',
      position: member.position || 'Member',
      blood_group: member.blood_group || '',
      photo: member.photo || '',
      previous_due: String(member.financials?.previous_due || 0),
      status: member.status,
    });
    setIsModalOpen(true);
  };

  // Save Member (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      error('Member name is required.');
      return;
    }

    try {
      const payload = {
        ...formData,
        previous_due: Number(formData.previous_due) || 0,
      };

      if (isEditing && currentMemberId) {
        await api.put(`/admin/members/${currentMemberId}`, payload);
        success('Member updated successfully.');
      } else {
        await api.post('/admin/members', payload);
        success('New member created successfully.');
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save member record.');
    }
  };

  // Confirm and Execute Delete
  const handleDeleteMember = async () => {
    if (!deleteConfirmMember) return;
    try {
      await api.delete(`/admin/members/${deleteConfirmMember.id}`);
      success(`Member ${deleteConfirmMember.name} deleted.`);
      setDeleteConfirmMember(null);
      fetchMembers();
    } catch {
      error('Failed to delete member.');
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Member Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
            Add, update, or remove club members and manage their profile and dues details.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* 2. Simplified Search Control */}
      <div className="p-4 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] placeholder-gray-400 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>
      </div>

      {/* 3. Members Table */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Loading members data...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-[#D4AF37] mx-auto" />
          <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB]">No Members Found</h3>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Try searching with a different name.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-[#C5CCE0]">
              <thead className="bg-white dark:bg-black text-gray-500 dark:text-[#9CA6C1] uppercase text-[11px] tracking-wider border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Member Name</th>
                  <th className="p-3.5">Blood Group</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-100 dark:hover:bg-[#1A2140] dark:bg-[#1A2140] transition-colors">
                    {/* Numeric ID: 1, 2, 3... */}
                    <td className="p-3.5 font-mono font-bold text-[#D4AF37]">{member.member_id || member.id}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
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
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-gray-500 dark:text-[#9CA6C1]" />}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-[#F7F7FB]">{member.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-[#9CA6C1]">{member.position || 'Member'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-rose-500 dark:text-rose-400 font-semibold">
                      {member.blood_group || '-'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-[#C5CCE0]">
                      {member.phone || '-'}
                    </td>
                    <td className="p-3.5 text-[11px] text-gray-500 dark:text-[#9CA6C1]">
                      {member.email || '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(member)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-[#7C3AED] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-gray-600 dark:text-[#C5CCE0] transition-colors"
                          title="Edit Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmMember(member)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-rose-600 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-rose-400 transition-colors"
                          title="Delete Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                {isEditing ? 'Edit Member' : 'Add New Member'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Member / President"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.blood_group || ''}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                value={formData.photo}
                onChange={(newPhoto) => setFormData({ ...formData, photo: newPhoto })}
                folder="members"
                label="Member Photo"
                placeholderText="Choose Photo"
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] text-xs font-semibold shadow shadow-slate-900/20"
                >
                  {isEditing ? 'Save Changes' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">Delete Member</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-[#C5CCE0]">
              Are you sure you want to delete member <strong>{deleteConfirmMember.name} (ID: {deleteConfirmMember.member_id || deleteConfirmMember.id})</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
