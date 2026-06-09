'use client';

import { useShare } from '@repo/shared';
import { RootType } from '@/models/social/enums/social.enum';
import { DetailView } from '@/components/post/detail-view';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export default function ShareInterceptingModal({ params }: { params: { shareId: string } }) {
  const router = useRouter();
  const { data: share, isLoading, isError } = useShare(params.shareId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-6xl w-[96vw] max-w-6xl p-0 overflow-hidden bg-slate-50 border-none">
        <VisuallyHidden>
          <DialogTitle>Chi tiết bài chia sẻ</DialogTitle>
        </VisuallyHidden>
        <div className="h-[90vh] overflow-y-auto">
          <DetailView 
            type={RootType.SHARE} 
            share={share} 
            isLoading={isLoading} 
            isError={isError} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
