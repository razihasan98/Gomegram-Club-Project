import React, { useRef, useState } from 'react';
import { UploadCloud, Trash2, RefreshCw, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import libheif from 'libheif-js/wasm-bundle';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  placeholderText?: string;
  acceptType?: 'image' | 'video' | 'all';
}

// Check if file is any kind of image or video
const isValidMedia = (file: File, acceptType: 'image' | 'video' | 'all'): boolean => {
  if (!file) return false;
  if (acceptType === 'video' || acceptType === 'all') {
    if (file.type && file.type.startsWith('video/')) return true;
    const videoExts = ['mp4', 'mov', 'webm', 'avi', 'mkv', '3gp'];
    const nameParts = file.name.split('.');
    if (nameParts.length > 1) {
      const ext = nameParts.pop()?.toLowerCase() || '';
      if (videoExts.includes(ext)) return true;
    }
    if (acceptType === 'video') return false;
  }
  
  if (acceptType === 'image' || acceptType === 'all') {
    if (file.type && file.type.startsWith('image/')) return true;
    const validExts = [
      'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg',
      'jfif', 'heic', 'heif', 'avif', 'tiff', 'tif', 'ico', 'raw'
    ];
    const nameParts = file.name.split('.');
    if (nameParts.length > 1) {
      const ext = nameParts.pop()?.toLowerCase() || '';
      return validExts.includes(ext);
    }
  }
  return true;
};

// Convert iPhone / Apple HEIC photos to standard JPEG in browser
const convertHeicIfNeeded = async (file: File): Promise<File> => {
  const fileName = file.name.toLowerCase();
  const isHeic =
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    file.type === 'image/heic' ||
    file.type === 'image/heif';

  if (!isHeic) return file;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const decoder = new libheif.HeifDecoder();
    const data = decoder.decode(new Uint8Array(arrayBuffer));
    if (!data || data.length === 0) return file;

    const image = data[0];
    const width = image.get_width();
    const height = image.get_height();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    const imgData = ctx.createImageData(width, height);
    await new Promise<void>((resolve, reject) => {
      image.display(imgData, (displayData: any) => {
        if (!displayData) return reject(new Error('HEIC decoding failed'));
        resolve();
      });
    });

    ctx.putImageData(imgData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'photo';
            const cleanFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
            resolve(cleanFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.9
      );
    });
  } catch (e) {
    console.warn('HEIC conversion failed:', e);
    return file;
  }
};

// Client-side image processor: compresses large phone/camera pictures to crisp 1080/1920p JPEG
const processImageFile = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // If it is SVG or GIF, preserve directly
    if (
      file.type === 'image/svg+xml' ||
      file.type === 'image/gif' ||
      file.name.endsWith('.svg') ||
      file.name.endsWith('.gif')
    ) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
              const cleanFile = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
              resolve(cleanFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.88
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = 'members',
  label = 'Media',
  placeholderText = 'Choose File',
  acceptType = 'image',
}) => {
  const { error, success } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);
  const [backupToDrive, setBackupToDrive] = useState<boolean>(false);

  const handleFile = async (rawFile: File) => {
    if (!rawFile) return;

    if (!isValidMedia(rawFile, acceptType)) {
      const err = acceptType === 'video' 
        ? 'Please select a valid video file (MP4, MOV, etc.)'
        : 'Please select a valid image file (JPG, PNG, WEBP, HEIC, etc.)';
      setUploadError(err);
      error(err);
      return;
    }

    setUploadError(null);
    setImageLoadFailed(false);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      let fileToUpload = rawFile;
      const isVideo = rawFile.type.startsWith('video/');

      if (!isVideo) {
        // 1. Convert iPhone HEIC if needed
        const convertedFile = await convertHeicIfNeeded(rawFile);
        setUploadProgress(30);

        // 2. Set immediate local preview from the converted file
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onChange(e.target.result as string);
          }
        };
        reader.readAsDataURL(convertedFile);

        // 3. Optimize image via Canvas
        fileToUpload = await processImageFile(convertedFile);
      } else {
        // Set local preview for video
        const url = URL.createObjectURL(rawFile);
        onChange(url);
      }
      setUploadProgress(60);

      // 4. Send to backend
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('folder', folder);
      formData.append('backup_to_drive', backupToDrive ? 'true' : 'false');

      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.min(95, Math.round((progressEvent.loaded * 100) / progressEvent.total));
            setUploadProgress(percent);
          }
        },
      });

      if (response.data?.url) {
        onChange(response.data.url);
        success('Photo uploaded successfully.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload photo to server.';
      setUploadError(msg);
      error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUploadError(null);
    setImageLoadFailed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-600 dark:text-[#C5CCE0]">
          {label}
        </label>
        {value && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle className="w-3 h-3" /> File Attached
          </span>
        )}
      </div>

      {/* Hidden native input with wide format support for all phones, laptops, and PCs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptType === 'video' ? "video/*" : (acceptType === 'image' ? "image/*,.jpg,.jpeg,.png,.webp,.jfif,.heic,.heif,.avif,.bmp,.gif,.svg,.tiff" : "image/*,video/*")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        /* Image Preview & Action Controls */
        <div className="relative p-3.5 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4 transition-all">
          <div className="relative group shrink-0">
            {imageLoadFailed ? (
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-[#1A2140] border-2 border-[#7C3AED]/40 flex items-center justify-center text-[#D4AF37]">
                <ImageIcon className="w-8 h-8" />
              </div>
            ) : (
              acceptType === 'video' || value.match(/\.(mp4|webm|mov|ogg)$/i) || value.startsWith('blob:') ? (
                <video
                  src={value}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#7C3AED]/40 shadow-lg shadow-black/60 bg-white dark:bg-black"
                  muted
                />
              ) : (
                <img
                  src={value}
                  alt="Selected file"
                  onError={() => setImageLoadFailed(true)}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#7C3AED]/40 shadow-lg shadow-black/60 bg-white dark:bg-black"
                />
              )
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
            <p className="text-xs font-semibold text-gray-900 dark:text-[#F7F7FB] truncate">
              {value.startsWith('data:') || value.startsWith('blob:') ? 'Selected File' : value.split('/').pop() || 'File'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-[#9CA6C1]">
              {isUploading ? `Uploading... ${uploadProgress}%` : 'File attached'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setImageLoadFailed(false);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2140] hover:bg-gray-200 dark:hover:bg-[#252D4A] text-[#D4AF37] hover:text-gray-900 dark:hover:text-[#F7F7FB] dark:text-[#F7F7FB] text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-gray-200 dark:border-gray-800"
              >
                <RefreshCw className={`w-3 h-3 ${isUploading ? 'animate-spin' : ''}`} />
                <span>Change File</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors border border-rose-900/30"
              >
                <Trash2 className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Dropzone / Button */
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#7C3AED] bg-[#7C3AED]/10 shadow-lg shadow-[#7C3AED]/20 scale-[1.01]'
              : 'border-gray-200 dark:border-gray-800 hover:border-[#7C3AED]/70 bg-white dark:bg-black hover:bg-white'
          }`}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-gray-900 dark:text-[#F7F7FB]">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-1">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 flex items-center justify-center text-[#7C3AED] shadow-inner">
                <UploadCloud className="w-5 h-5" />
              </div>

              <p className="text-xs font-semibold text-gray-900 dark:text-[#F7F7FB]">
                {placeholderText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Google Drive Backup Checkbox */}
      <div className="flex items-center gap-2 pt-1 pl-1">
        <input
          type="checkbox"
          id="backupToDrive"
          checked={backupToDrive}
          onChange={(e) => setBackupToDrive(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED] dark:border-gray-700 dark:bg-[#1A2140] cursor-pointer"
        />
        <label htmlFor="backupToDrive" className="text-[11px] font-medium text-gray-700 dark:text-[#9CA6C1] cursor-pointer select-none">
          Backup to Google Drive
        </label>
      </div>

      {uploadError && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}
    </div>
  );
};
