'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  // để bạn tuỳ chỉnh màu nút confirm theo hành động
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void;
};

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'default',
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-sky-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-rose-600">
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="text-slate-600">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="border-sky-200 hover:bg-sky-50">
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            className={
              confirmVariant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-sky-500 hover:bg-sky-600 text-white'
            }
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
