import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Save, Check, Edit2, X } from 'lucide-react';
import api from '../../services/api';
import { ImageUpload } from '../../components/ImageUpload';

interface SliderImage {
    id: number;
    image_path: string;
    order: number;
    is_active: boolean;
    title?: string;
    subtitle?: string;
}

const AdminSlider = () => {
    const [images, setImages] = useState<SliderImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [interval, setInterval] = useState<number | string>(5);
    const [savingInterval, setSavingInterval] = useState(false);

    // Add Image Modal / Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploadImage, setUploadImage] = useState('');
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadSubtitle, setUploadSubtitle] = useState('');

    // Edit state
    const [editingImageId, setEditingImageId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSubtitle, setEditSubtitle] = useState('');

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return path;
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sliderRes, settingsRes] = await Promise.all([
                api.get('/admin/slider'),
                api.get('/admin/settings')
            ]);
            setImages(sliderRes.data.images || []);
            if (settingsRes.data.settings?.slider_interval) {
                setInterval(parseInt(settingsRes.data.settings.slider_interval));
            }
        } catch (error) {
            console.error('Failed to fetch slider data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNewSlider = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadImage) {
            alert('Please select and upload an image first');
            return;
        }

        setUploading(true);
        try {
            const response = await api.post('/admin/slider', {
                image_path: uploadImage,
                title: uploadTitle,
                subtitle: uploadSubtitle,
            });
            setImages([...images, response.data.image]);
            setUploadImage('');
            setUploadTitle('');
            setUploadSubtitle('');
            setShowAddForm(false);
        } catch (error) {
            console.error('Failed to save slider image', error);
            alert('Failed to save slider image');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;
        
        try {
            await api.delete(`/admin/slider/${id}`);
            setImages(images.filter((img) => img.id !== id));
        } catch (error) {
            console.error('Failed to delete image', error);
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const response = await api.patch(`/admin/slider/${id}/toggle-status`);
            setImages(images.map((img) => (img.id === id ? response.data.image : img)));
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const moveImage = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === images.length - 1)
        ) {
            return;
        }

        const newImages = [...images];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        const temp = newImages[index];
        newImages[index] = newImages[swapIndex];
        newImages[swapIndex] = temp;
        
        // Update order property
        newImages.forEach((img, i) => img.order = i + 1);
        
        setImages(newImages);

        // Save order to backend
        try {
            await api.post('/admin/slider/reorder', {
                images: newImages.map(img => ({ id: img.id, order: img.order }))
            });
        } catch (error) {
            console.error('Failed to reorder', error);
            // Revert on error
            fetchData();
        }
    };

    const saveInterval = async () => {
        if (interval === '' || Number(interval) < 1) {
            alert('Please enter a valid number greater than 0');
            return;
        }
        setSavingInterval(true);
        try {
            await api.post('/admin/settings', { slider_interval: interval.toString() });
            alert('Rotation timer saved successfully');
        } catch (error) {
            console.error('Failed to save interval', error);
        } finally {
            setSavingInterval(false);
        }
    };

    const startEditing = (img: SliderImage) => {
        setEditingImageId(img.id);
        setEditTitle(img.title || '');
        setEditSubtitle(img.subtitle || '');
    };

    const saveEdit = async () => {
        if (editingImageId === null) return;
        try {
            const response = await api.put(`/admin/slider/${editingImageId}`, {
                title: editTitle,
                subtitle: editSubtitle
            });
            setImages(images.map((img) => (img.id === editingImageId ? response.data.image : img)));
            setEditingImageId(null);
        } catch (error) {
            console.error('Failed to save text', error);
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">Loading slider settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-gray-900 dark:text-[#F7F7FB]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-[#F7F7FB]">
                        Slider Settings
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
                        Manage homepage hero slider images and rotation settings.
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all"
                    >
                        {showAddForm ? <X size={16} /> : <Plus size={16} />}
                        <span>{showAddForm ? 'Close Form' : 'Add Image'}</span>
                    </button>
                </div>
            </div>

            {/* Add New Slider Image Form */}
            {showAddForm && (
                <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                            Upload New Slider Image
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveNewSlider} className="space-y-5">
                        <ImageUpload
                            value={uploadImage}
                            onChange={(url) => setUploadImage(url)}
                            folder="sliders"
                            label="Slider Photo *"
                            placeholderText="Select or Drag Slider Banner Photo"
                            acceptType="image"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                                    Animated Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Welcome to Swapnosiri"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                                    Animated Subtitle (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Unity, Culture & Community Welfare"
                                    value={uploadSubtitle}
                                    onChange={(e) => setUploadSubtitle(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={uploading || !uploadImage}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-all shadow-lg shadow-[#7C3AED]/20 disabled:opacity-50"
                            >
                                {uploading ? 'Saving...' : 'Confirm & Save Slider'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowAddForm(false); setUploadImage(''); }}
                                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Rotation Settings */}
            <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                        Rotation Settings
                    </h3>
                </div>
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-md">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                                Transition Interval (seconds)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                            />
                        </div>
                        <button
                            onClick={saveInterval}
                            disabled={savingInterval}
                            className="mt-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center gap-1.5 shadow-lg shadow-[#7C3AED]/20 transition-all self-end sm:self-auto h-[38px]"
                        >
                            <Save size={14} />
                            <span>{savingInterval ? 'Saving...' : 'Save Timer'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Slider Images List */}
            <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                        Active Images ({images.length})
                    </h3>
                    <p className="text-xs text-gray-400">
                        Drag or use arrows to reorder
                    </p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {images.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
                            <p className="text-sm font-medium">No slider images uploaded yet.</p>
                            <p className="text-xs mt-1 text-gray-400">Click &quot;Add Image&quot; above to upload your first slider photo.</p>
                        </div>
                    ) : (
                        images.map((img, index) => (
                            <div
                                key={img.id}
                                className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
                            >
                                <div className="flex items-center gap-2 self-center md:self-auto text-gray-400">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            disabled={index === 0}
                                            onClick={() => moveImage(index, 'up')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            disabled={index === images.length - 1}
                                            onClick={() => moveImage(index, 'down')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <span className="text-xs font-bold w-4 text-center">{index + 1}</span>
                                </div>

                                <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex-shrink-0">
                                    <img
                                        src={getImageUrl(img.image_path)}
                                        alt={img.title || 'Slider image'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 space-y-1 w-full">
                                    {editingImageId === img.id ? (
                                        <div className="space-y-2 py-2">
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB]"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Subtitle"
                                                value={editSubtitle}
                                                onChange={(e) => setEditSubtitle(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB]"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveEdit}
                                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                                                >
                                                    <Check size={12} /> Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingImageId(null)}
                                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-800 rounded-lg text-xs font-semibold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-900 dark:text-[#F7F7FB]">
                                                {img.title || <span className="text-gray-400 italic font-normal">No Title</span>}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-[#9CA6C1]">
                                                {img.subtitle || <span className="text-gray-400 italic">No Subtitle</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => handleToggleStatus(img.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                                            img.is_active
                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                                : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                                        }`}
                                    >
                                        {img.is_active ? 'Active' : 'Inactive'}
                                    </button>

                                    {editingImageId !== img.id && (
                                        <button
                                            onClick={() => startEditing(img)}
                                            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                            title="Edit Text"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                        title="Delete Image"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSlider;
