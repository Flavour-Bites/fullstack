import { useState, useCallback } from 'react';
import { http } from '@client/lib/http';
import { useToast } from '../../../components/Toast';
import type { ApiResponse } from '@/shared/api';

export interface UseFileUploadReturn {
  uploading: boolean;
  uploadedImageUrl: string | null;
  uploadError: string | null;
  isDragging: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  clearUploadedImage: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const { data } = await http.post<ApiResponse<{ image: { url: string } }>>('/api/uploads/image', {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        dataBase64,
      });
      if (!data.success) throw new Error(data.error || 'Upload failed');
      setUploadedImageUrl(data.image.url);
      showToast('Image Uploaded', 'Your reference image is ready. Submit when you are.', 'success');
    } catch (err: any) {
      setUploadError(err.message);
      showToast('Upload Failed', err.message + ' You can still submit without an image.', 'error');
    } finally {
      setUploading(false);
    }
  }, [showToast]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) uploadFile(file);
  }, [uploadFile]);

  const clearUploadedImage = useCallback(() => {
    setUploadedImageUrl(null);
    setUploadError(null);
  }, []);

  return {
    uploading,
    uploadedImageUrl,
    uploadError,
    isDragging,
    handleFileChange,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    clearUploadedImage,
  };
}