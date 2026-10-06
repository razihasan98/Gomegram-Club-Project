import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Save, Check, Edit2 } from 'lucide-react';
import api from '../../services/api';

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

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadSubtitle, setUploadSubtitle] = useState('');

    // Edit state
    const [editingImageId, setEditingImageId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSubtitle, setEditSubtitle] = useState('');

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';
        return `${backendUrl}${path}`;
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
            setImages(sliderRes.data.images);
            if (settingsRes.data.settings.slider_interval) {
                setInterval(parseInt(settingsRes.data.settings.slider_interval));
            }
        } catch (error) {
            console.error('Failed to fetch slider data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setPreviewUrl(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
            setUploadTitle('');
            setUploadSubtitle('');
        }
        if (e.target) e.target.value = '';
    };

    const confirmUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('image', selectedFile);
        if (uploadTitle) formData.append('title', uploadTitle);
        if (uploadSubtitle) formData.append('subtitle', uploadSubtitle);

        setUploading(true);
        try {
            const response = await api.post('/admin/slider', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImages([...images, response.data.image]);
            setSelectedFile(null);
            setPreviewUrl(null);
            setUploadTitle('');
            setUploadSubtitle('');
        } catch (error) {
            console.error('Failed to upload image', error);
            alert('Failed to upload image');
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
            // Show success briefly
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
                    <input
                        type="file"
                        id="slider-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                    <label htmlFor="slider-upload">
                        <span
                            className={`px-4 py-2 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] flex items-center gap-1.5 shadow-lg shadow-slate-900/20 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <Plus size={16} />
                            {uploading ? 'Uploading...' : 'Add Image'}
                        </span>
                    </label>
                </div>
            </div>

            {selectedFile && previewUrl && (
                <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm p-6">
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB] mb-4">
                        Upload New Image
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3">
                            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">Animated Title</label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">Animated Subtitle</label>
                                <input
                                    type="text"
                                    value={uploadSubtitle}
                                    onChange={(e) => setUploadSubtitle(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={confirmUpload}
                                    disabled={uploading}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-all shadow-lg shadow-[#7C3AED]/20"
                                >
                                    {uploading ? 'Uploading...' : 'Confirm Upload'}
                                </button>
                                <button
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                    disabled={uploading}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                        Rotation Settings
                    </h3>
                </div>
                <div className="p-6">
                    <div className="flex items-end gap-4 max-w-md">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0] mb-1">
                                Transition Interval (seconds)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={interval}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setInterval(val === '' ? '' : parseInt(val));
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-[#F7F7FB] focus:outline-none focus:border-[#7C3AED]"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">How long each image should be displayed.</p>
                        </div>
                        <div className="pb-6">
                            <button
                                onClick={saveInterval}
                                disabled={savingInterval}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:text-[#0F172A] dark:hover:bg-gray-200 flex items-center gap-1.5 shadow-md shadow-slate-900/10 transition-all"
                            >
                                {savingInterval ? <Save size={16} /> : <Check size={16} />}
                                <span>Save Timer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-[#F7F7FB]">
                        Manage Images
                    </h3>
                </div>
                <div>
                    {images.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 dark:text-[#9CA6C1]">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700 mb-4" />
                            <p className="text-sm font-semibold">No slider images uploaded yet.</p>
                            <p className="text-xs mt-1">Upload images to show them on the homepage.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {images.map((image, index) => (
                                <li key={image.id} className={`p-4 flex items-center gap-4 transition-colors ${!image.is_active ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
                                    <div className="flex flex-col gap-1 text-gray-400 dark:text-gray-600">
                                        <button 
                                            onClick={() => moveImage(index, 'up')}
                                            disabled={index === 0}
                                            className="hover:text-[#7C3AED] disabled:opacity-30 disabled:hover:text-inherit"
                                        >
                                            <GripVertical size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="h-20 w-32 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                                        <img
                                            src={getImageUrl(image.image_path)}
                                            alt="Slider"
                                            className={`h-full w-full object-cover ${!image.is_active ? 'opacity-50 grayscale' : ''}`}
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-[#F7F7FB]">
                                                    Image {index + 1}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-1">
                                                    Status: {image.is_active ? <span className="text-emerald-500 font-semibold">Active</span> : <span className="text-gray-400 font-semibold">Hidden</span>}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {editingImageId === image.id ? (
                                            <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-xs text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Subtitle</label>
                                                    <input
                                                        type="text"
                                                        value={editSubtitle}
                                                        onChange={(e) => setEditSubtitle(e.target.value)}
                                                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-xs text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="text-xs bg-[#7C3AED] text-white px-3 py-1.5 rounded-lg hover:bg-[#6D28D9]">Save</button>
                                                    <button onClick={() => setEditingImageId(null)} className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500 dark:text-[#9CA6C1] mt-2 space-y-0.5">
                                                <p><span className="font-semibold text-gray-400">Title:</span> {image.title || <span className="italic opacity-50">None</span>}</p>
                                                <p><span className="font-semibold text-gray-400">Subtitle:</span> {image.subtitle || <span className="italic opacity-50">None</span>}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                        {editingImageId !== image.id && (
                                            <button
                                                onClick={() => startEditing(image)}
                                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-[#9CA6C1] hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
                                                title="Edit Text"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleStatus(image.id)}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-[#9CA6C1] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {image.is_active ? 'Hide' : 'Show'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(image.id)}
                                            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSlider;
