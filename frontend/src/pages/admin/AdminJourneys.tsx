import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Map, Search } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Journey } from '../../types';

export const AdminJourneys: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: 0,
    year: '',
    title: '',
    description: '',
    order: 0,
  });

  const { success, error } = useToast();

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/journeys');
      setJourneys(data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch journeys');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: 0, year: '', title: '', description: '', order: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (journey: Journey) => {
    setIsEditing(true);
    setFormData({
      id: journey.id,
      year: journey.year,
      title: journey.title,
      description: journey.description,
      order: journey.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    try {
      await api.delete(`/admin/journeys/${id}`);
      success('Journey milestone deleted successfully');
      fetchJourneys();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete journey');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEditing) {
        await api.put(`/admin/journeys/${formData.id}`, formData);
        success('Journey milestone updated successfully');
      } else {
        await api.post('/admin/journeys', formData);
        success('Journey milestone added successfully');
      }
      setIsModalOpen(false);
      fetchJourneys();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save journey');
    } finally {
      setSaving(false);
    }
  };

  const filteredJourneys = journeys.filter(
    (j) =>
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.year || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-[#F7F7FB] flex items-center gap-2">
            <Map className="w-6 h-6 text-[#8B5CF6]" />
            Our Journey Management
          </h1>
          <p className="text-gray-500 dark:text-[#9CA6C1] text-sm mt-1">
            Manage the history and milestones of the club.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-black p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#9CA6C1]" />
          <input
            type="text"
            placeholder="Search by year or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 text-sm dark:text-[#F7F7FB]"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-[#C5CCE0]">
            <thead className="bg-gray-50 dark:bg-[#1A2140] text-gray-900 dark:text-[#F7F7FB] font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Year</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Title</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800">Description</th>
                <th className="p-4 border-b border-gray-100 dark:border-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2C355D]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredJourneys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-[#9CA6C1]">
                    No journey milestones found.
                  </td>
                </tr>
              ) : (
                filteredJourneys.map((journey) => (
                  <tr key={journey.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2140]/50 transition-colors">
                    <td className="p-4 whitespace-nowrap font-bold text-[#D4AF37]">
                      {journey.year}
                    </td>
                    <td className="p-4 font-semibold text-gray-900 dark:text-[#F7F7FB]">
                      {journey.title}
                    </td>
                    <td className="p-4 max-w-md truncate">
                      {journey.description}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(journey)}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Edit Milestone"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(journey.id)}
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-black rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-[#F7F7FB]">
                {isEditing ? 'Edit Milestone' : 'Add Milestone'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1A2140] rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-[#C5CCE0] mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#8B5CF6] text-sm dark:text-[#F7F7FB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-[#C5CCE0] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#8B5CF6] text-sm dark:text-[#F7F7FB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-[#C5CCE0] mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#8B5CF6] text-sm dark:text-[#F7F7FB]"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-[#C5CCE0] bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#2C355D] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 text-sm font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] rounded-xl shadow-lg shadow-slate-900/20 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
