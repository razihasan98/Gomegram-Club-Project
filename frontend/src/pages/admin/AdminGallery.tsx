import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  PlusCircle,
  Trash2,
  Edit2,
  X,
  Star,
  Video
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { GalleryItem, ClubEvent } from '../../types';
import { ImageUpload } from '../../components/ImageUpload';

export const AdminGallery: React.FC = () => {
  const { success, error } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add / Edit Modal
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    type: 'image',
    image_path: '',
    category: 'Cultural Program',
    event_id: '',
    is_featured: false,
    order: 0,
  });

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const [galRes, evtRes] = await Promise.all([
        api.get('/admin/gallery'),
        api.get('/admin/events'),
      ]);
      if (galRes.data?.gallery) setGallery(galRes.data.gallery);
      if (evtRes.data?.events) setEvents(evtRes.data.events);
    } catch {
      error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      title: '',
      caption: '',
      type: 'image',
      image_path: '',
      category: 'Cultural Program',
      event_id: events.length > 0 ? String(events[0].id) : '',
      is_featured: false,
      order: 0,
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      title: item.title,
      caption: item.caption || '',
      type: item.type || 'image',
      image_path: item.image_path,
      category: item.category,
      event_id: item.event_id ? String(item.event_id) : '',
      is_featured: item.is_featured,
      order: item.order,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_path) {
      error('Title and Image URL are required.');
      return;
    }

    try {
      if (isEditing && currentId) {
        await api.put(`/admin/gallery/${currentId}`, {
          ...formData,
          event_id: formData.event_id ? Number(formData.event_id) : null,
        });
        success('Gallery item updated.');
      } else {
        await api.post('/admin/gallery', {
          ...formData,
          event_id: formData.event_id ? Number(formData.event_id) : null,
        });
        success('Photo added to gallery.');
      }
      setIsOpen(false);
      fetchGallery();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save gallery item.');
    }
  };

  const getThumbnail = (item: GalleryItem) => {
    if (item.type === 'video') {
      const match = item.image_path.match(/embed\/([^?]+)/) || item.image_path.match(/v=([^&]+)/);
      const videoId = match ? match[1] : null;
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1000&q=80'; // Default video placeholder
    }
    return item.image_path;
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this photo from gallery?')) return;
    try {
      await api.delete(`/admin/gallery/${id}`);
      success('Photo removed.');
      fetchGallery();
    } catch {
      error('Failed to delete photo.');
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
            Photo Gallery Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
            Upload, organize, and manage photo albums of annual pujas, picnics, and cultural celebrations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Loading photo albums...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col justify-between group hover:border-[#8B5CF6]/40 shadow-xl transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={getThumbnail(item)}
                  alt={item.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-black/85 dark:bg-black/85 text-[#D4AF37] border border-gray-200 dark:border-gray-800">
                    {item.category}
                  </span>
                </div>
                {item.is_featured && (
                  <div className="absolute top-2 left-2 p-1 rounded-full bg-[#7C3AED] text-gray-900 dark:text-[#F7F7FB] shadow" title="Featured Photo">
                    <Star className="w-3 h-3 fill-white" />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-heading font-bold text-xs text-gray-900 dark:text-[#F7F7FB] line-clamp-1">{item.title}</h4>
                {item.caption && (
                  <p className="text-[11px] text-gray-500 dark:text-[#9CA6C1] line-clamp-2">{item.caption}</p>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-black/50 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-[#7C3AED] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-gray-600 dark:text-[#C5CCE0]"
                  title="Edit Caption"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-rose-600 hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-rose-400"
                  title="Delete Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-black/85 dark:bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-gray-900 dark:text-[#F7F7FB]">
                {isEditing ? 'Edit Photo Details' : 'Add Photo to Gallery'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-500 dark:text-[#9CA6C1] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter photo title"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>


              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Media Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-gray-900 dark:text-[#F7F7FB]">
                    <input
                      type="radio"
                      name="media_type"
                      value="image"
                      checked={formData.type === 'image'}
                      onChange={() => setFormData({ ...formData, type: 'image', image_path: '' })}
                      className="text-[#7C3AED] focus:ring-0"
                    />
                    Image
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-900 dark:text-[#F7F7FB]">
                    <input
                      type="radio"
                      name="media_type"
                      value="video"
                      checked={formData.type === 'video'}
                      onChange={() => setFormData({ ...formData, type: 'video', image_path: '' })}
                      className="text-[#7C3AED] focus:ring-0"
                    />
                    Video (Direct Upload)
                  </label>
                </div>
              </div>

              {formData.type === 'image' ? (
                <ImageUpload
                  value={formData.image_path}
                  onChange={(newImg) => setFormData({ ...formData, image_path: newImg })}
                  folder="gallery"
                  label="Gallery Photo *"
                  placeholderText="Choose Photo"
                  acceptType="image"
                />
              ) : (
                <ImageUpload
                  value={formData.image_path}
                  onChange={(newImg) => setFormData({ ...formData, image_path: newImg })}
                  folder="gallery"
                  label="Gallery Video *"
                  placeholderText="Choose Video File"
                  acceptType="video"
                />
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                >

                  <option value="Cultural Program">Cultural Program</option>
                  <option value="Social Activities">Social Activities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Brief photo caption..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none resize-none"
                />
              </div>


              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-gray-900 dark:text-[#F7F7FB] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] text-xs font-semibold shadow shadow-slate-900/20"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
