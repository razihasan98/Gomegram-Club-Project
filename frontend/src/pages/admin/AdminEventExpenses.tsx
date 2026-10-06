import React, { useState, useEffect } from 'react';
import { ClubEvent, EventExpense } from '../../types';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useClub } from '../../context/ClubContext';
import { Plus, Edit2, Trash2, X, Wallet, Calendar, FileText } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

export const AdminEventExpenses: React.FC = () => {
  const { success, error } = useToast();
  const { formatBDT } = useClub();
  const [expenses, setExpenses] = useState<EventExpense[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Add / Edit Modal
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    event_id: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, evtRes] = await Promise.all([
        api.get('/admin/event-expenses' + (selectedEventId ? `?event_id=${selectedEventId}` : '')),
        api.get('/admin/events'),
      ]);
      if (expRes.data?.expenses) setExpenses(expRes.data.expenses);
      if (evtRes.data?.events) setEvents(evtRes.data.events);
    } catch {
      error('Failed to load event expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEventId]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      event_id: '',
      description: '',
      amount: '',
      expense_date: '',
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item: EventExpense) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      event_id: String(item.event_id),
      description: item.description,
      amount: String(item.amount),
      expense_date: item.expense_date || new Date().toISOString().split('T')[0],
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event_id || !formData.description || !formData.amount) {
      error('Event, Description, and Amount are required.');
      return;
    }

    try {
      if (isEditing && currentId) {
        await api.put(`/admin/event-expenses/${currentId}`, formData);
        success('Expense updated.');
      } else {
        await api.post('/admin/event-expenses', formData);
        success('Expense recorded.');
      }
      setIsOpen(false);
      fetchData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/admin/event-expenses/${id}`);
      success('Expense deleted.');
      fetchData();
    } catch {
      error('Failed to delete expense.');
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F7F7FB]">Event Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-[#9CA6C1] mt-1">Track costs and expenditures for club events</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="flex-1 sm:w-48 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
          >
            <option value="">All Events</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>{evt.title}</option>
            ))}
          </select>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] text-sm font-semibold rounded-xl shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-[#9CA6C1] font-medium">Total Expenses</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-[#F7F7FB]">
              {formatBDT(totalExpense)}
            </h3>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-[#1A2140] text-gray-500 dark:text-[#9CA6C1] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Event</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#2C355D]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-[#9CA6C1]">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-[#9CA6C1]">
                    No expenses recorded.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2140]/50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 dark:text-[#C5CCE0]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString('en-GB') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-[#7C3AED]/10 text-[#7C3AED]">
                        {expense.event?.title || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-[#F7F7FB]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-rose-500 dark:text-rose-400">
                      {formatBDT(Number(expense.amount))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(expense)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-black rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                {isEditing ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-[#F7F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Select Event *
                </label>
                <select
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                  required
                >
                  <option value="" disabled>Select an Event</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Tent Rent, Food, Decoration"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Amount (৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Expense Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.expense_date ? new Date(formData.expense_date) : null}
                    onChange={(date: Date | null) => setFormData({ ...formData, expense_date: date ? format(date, 'yyyy-MM-dd') : '' })}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1A2140] border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED] pr-10"
                    wrapperClassName="w-full"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-[#C5CCE0] hover:bg-gray-100 dark:hover:bg-[#1A2140] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl shadow-slate-900/20 transition-all"
                >
                  {isEditing ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
