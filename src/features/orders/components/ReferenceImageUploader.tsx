import type React from 'react';
import { Paperclip, CheckCircle2, Loader2 } from 'lucide-react';
import { t } from '../../../i18n/index';

interface ReferenceImageUploaderProps {
  readonly uploading: boolean;
  readonly uploadedImageUrl: string | null;
  readonly uploadError: string | null;
  readonly isDragging: boolean;
  readonly onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly onDragOver: (e: React.DragEvent) => void;
  readonly onDragEnter: (e: React.DragEvent) => void;
  readonly onDragLeave: (e: React.DragEvent) => void;
  readonly onDrop: (e: React.DragEvent) => void;
}

function getContainerStyles(
  isDragging: boolean,
  uploading: boolean,
  uploadedImageUrl: string | null,
  uploadError: string | null,
): string {
  if (isDragging) {
    return 'border-lux-gold bg-lux-gold/10 scale-[1.02]';
  }
  if (uploading) {
    return 'border-lux-gold bg-lux-gold/5';
  }
  if (uploadedImageUrl) {
    return 'border-emerald-400/50 bg-emerald-500/5';
  }
  if (uploadError) {
    return 'border-red-400/50 bg-red-500/5';
  }
  return 'border-stone-300 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/30';
}

function renderUploadContent(
  isDragging: boolean,
  uploading: boolean,
  uploadedImageUrl: string | null,
  uploadError: string | null,
): React.ReactNode {
  if (isDragging) {
    return (
      <>
        <div className="w-8 h-8 rounded-full bg-lux-gold/20 flex items-center justify-center mx-auto mb-2">
          <Paperclip className="w-4 h-4 text-lux-gold" />
        </div>
        <p className="text-xs text-lux-gold font-semibold">Drop your image here</p>
      </>
    );
  }

  if (uploading) {
    return (
      <>
        <Loader2 className="w-6 h-6 text-lux-gold mx-auto mb-2 animate-spin" />
        <p className="text-xs text-lux-gold font-semibold">Uploading...</p>
      </>
    );
  }

  if (uploadedImageUrl) {
    return (
      <>
        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Image uploaded</p>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Click to replace</p>
      </>
    );
  }

  if (uploadError) {
    return <p className="text-xs text-red-500 font-semibold">Upload failed — click to retry</p>;
  }

  return (
    <>
      <Paperclip className="w-6 h-6 text-stone-400 dark:text-stone-600 mx-auto mb-2" />
      <p className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
        Drag or click to upload a reference image
      </p>
      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">JPG, PNG up to 10MB</p>
    </>
  );
}

export default function ReferenceImageUploader({
  uploading,
  uploadedImageUrl,
  uploadError,
  isDragging,
  onFileChange,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}: Readonly<ReferenceImageUploaderProps>) {
  const containerStyle = getContainerStyles(isDragging, uploading, uploadedImageUrl, uploadError);
  const content = renderUploadContent(isDragging, uploading, uploadedImageUrl, uploadError);

  return (
    <div>
      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-400 font-bold block mb-1">
        {t('order.uploadReference')}
      </label>
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border border-dashed rounded-sm p-6 text-center relative transition-colors font-sans ${containerStyle}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
        />
        {content}
      </div>
    </div>
  );
}
