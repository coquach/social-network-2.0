'use client';
import {
  FeelingPopover
} from '@/components/feeling-hover-popup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { feelingsUI, FeelingUI } from '@/lib/types/feeling';
import { Emotion } from '@repo/shared';
import { TrendingUp, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PersonalFeed } from './_components/personal-feed';
import { TrendingFeed } from './_components/trending-feed';

enum HomeFeedTab {
  MYFEED = 'Cá nhân',
  TRENDING = 'Xu hướng',
}

export const HomeFeed = () => {
  const [mainEmotion, setMainEmotion] = useState<Emotion | undefined>(
    undefined
  );
  const [showFeeling, setShowFeeling] = useState(false);
  const feelingAnchorRef = useRef<HTMLButtonElement>(null!);

  const selectedFeeling = useMemo(
    () => feelingsUI.find((item) => item.type === mainEmotion) ?? null,
    [mainEmotion]
  );

  const handleSelectFeeling = (feeling: FeelingUI | null) => {
    setMainEmotion(feeling?.type);
    setShowFeeling(false);
  };

  useEffect(() => {
    if (!showFeeling) return;

    const onMouseDown = (e: MouseEvent) => {
      const el = feelingAnchorRef.current;
      const target = e.target as HTMLElement | null;
      if (!el) return;
      if (target?.closest('[data-feeling-popup="true"]')) return;
      if (!el.contains(e.target as Node)) setShowFeeling(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFeeling(false);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showFeeling]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-sky-50 via-white to-sky-100 p-6 shadow-md dark:border-primary/10 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/90">
              Bảng tin
            </p>
            <h2 className="text-2xl font-bold text-primary">
              Theo dõi điều mới nhất
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Lọc theo cảm xúc và chuyển tab nhanh chóng.
            </p>
          </div>

          <FeelingPopover
            open={showFeeling}
            onOpenChange={setShowFeeling}
            selectedFeeling={selectedFeeling}
            onSelect={handleSelectFeeling}
            side="bottom"
          >
            <button
              type="button"
              ref={feelingAnchorRef}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-smooth hover:bg-accent"
            >
              <span
                className={`text-base ${
                  selectedFeeling?.color ?? 'text-primary'
                }`}
              >
                {selectedFeeling?.emoji ?? '✨'}
              </span>
              {selectedFeeling?.name ?? 'Tất cả cảm xúc'}
            </button>
          </FeelingPopover>
        </div>
      </div>

      <Tabs defaultValue={HomeFeedTab.TRENDING} className="w-full">
      <TabsList className="grid w-full grid-cols-2 rounded-full border border-primary/20 bg-accent/50 h-[3.75rem] shadow-sm dark:border-primary/10 dark:bg-slate-900/60">
        <TabsTrigger
          value={HomeFeedTab.TRENDING}
          className="flex w-full items-center justify-center rounded-full text-lg font-semibold text-muted-foreground transition-smooth hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:hover:text-primary dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary"
        >
          <TrendingUp size={18} />
          {HomeFeedTab.TRENDING}
        </TabsTrigger>
        <TabsTrigger
          value={HomeFeedTab.MYFEED}
          className="flex w-full items-center justify-center rounded-full text-lg font-semibold text-muted-foreground transition-smooth hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:hover:text-primary dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary"
        >
          <UserRound size={18} />
          {HomeFeedTab.MYFEED}
        </TabsTrigger>
        </TabsList>

        <TabsContent
          value={HomeFeedTab.TRENDING}
          className="mt-6 text-gray-700"
        >
          <TrendingFeed mainEmotion={mainEmotion} />
        </TabsContent>
        <TabsContent value={HomeFeedTab.MYFEED} className="mt-6 text-gray-700">
          <PersonalFeed mainEmotion={mainEmotion} />
        </TabsContent>
      </Tabs>
    </section>
  );
};
