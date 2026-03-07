'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useImageViewerModal } from '@/store/use-image-viewer-modal';
import { Download, X } from '@/lib/icons';
import Image from 'next/image';

export const ImageViewerModal = () => {
  const { isOpen, src, alt, onClose } = useImageViewerModal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] border-0 bg-slate-900/90 p-0">
        <div className="relative h-[75vh] w-full">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 py-3 sm:px-4">
            {src ? (
              <a
                href={src}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
                Tải ảnh
              </a>
            ) : (
              <div />
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full cursor-pointer bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {src && (
            <Image
              src={src}
              alt={alt || 'Preview'}
              fill
              loading="lazy"
              className="object-contain"
              sizes="100vw"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
