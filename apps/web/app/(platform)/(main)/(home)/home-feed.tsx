'use client';
import {
  FeelingPopover
} from '@/components/feeling-hover-popup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { feelingsUI, FeelingUI } from '@/lib/types/feeling';
import { Emotion } from '@/models/social/enums/social.enum';
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
      <div className="rounded-2xl border border-sky-200 bg-linear-to-br from-sky- via-white to-sky-100 p-6 shadow-md dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-500/90">
              Bảng tin
            </p>
            <h2 className="text-2xl font-bold text-sky-500">
              Theo dõi điều mới nhất
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Lọc theo cảm xúc và chuyển tab nhanh chóng.
            </p>
          </div>

          <FeelingPopover
            open={showFeeling}
            onOpenChange={setShowFeeling}
            selectedFeeling={selectedFeeling}
            onSelect={handleSelectFeeling}
            side="bottom" // hoặc "top"
          >
            <button
              type="button"
              ref={feelingAnchorRef}
              className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-50"
            >
              <span
                className={`text-base ${
                  selectedFeeling?.color ?? 'text-sky-600'
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
      <TabsList className="grid w-full grid-cols-2 rounded-full border border-sky-300 bg-sky-100 p-y-5 h-15 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
        <TabsTrigger
          value={HomeFeedTab.TRENDING}
          className="flex w-full items-center justify-center rounded-full text-lg font-semibold text-slate-500 transition hover:text-sky-700 data-[state=active]:bg-sky-500 data-[state=active]:text-white dark:text-slate-400 dark:hover:text-sky-300 dark:data-[state=active]:bg-sky-400/20 dark:data-[state=active]:text-sky-200"
        >
          <TrendingUp size={18} />
          {HomeFeedTab.TRENDING}
        </TabsTrigger>
        <TabsTrigger
          value={HomeFeedTab.MYFEED}
          className="flex  w-full items-center justify-center rounded-full text-lg font-semibold text-slate-500 transition hover:text-sky-700 data-[state=active]:bg-sky-500 data-[state=active]:text-white dark:text-slate-400 dark:hover:text-sky-300 dark:data-[state=active]:bg-sky-400/20 dark:data-[state=active]:text-sky-200"
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
