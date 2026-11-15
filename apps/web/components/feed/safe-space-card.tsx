'use client';

import { Sparkles } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { FeedInterventionDTO, useAssistantStore } from '@repo/shared';
import { useCallback } from 'react';

/**
 * "Góc nhỏ lắng nghe" — Safe Space intervention card.
 * Renders backend-provided copy (title / description / buttonText) with a
 * gentle, non-judgmental look. Opens the AI Chatbot with a Safe Space
 * seeded context.
 */
export function SafeSpaceCard({ data }: { data: FeedInterventionDTO }) {
  const openWithProactiveContext = useAssistantStore(
    (s) => s.openWithProactiveContext,
  );

  const handleChat = useCallback(() => {
    openWithProactiveContext({
      interventionId: data.id,
      promptContext: `${data.title}. ${data.description}`,
    });
  }, [openWithProactiveContext, data]);

  return (
    <section
      aria-label={data.title}
      className={cn(
        'mx-auto w-full max-w-2xl rounded-2xl border border-violet-100',
        'bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50',
        'px-6 py-8 text-center shadow-sm',
      )}
    >
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 shadow-sm">
        <Sparkles size={22} className="text-violet-500" aria-hidden />
      </div>

      <h3 className="text-base font-semibold text-slate-800">{data.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {data.description}
      </p>

      <button
        type="button"
        onClick={handleChat}
        className={cn(
          'mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5',
          'bg-violet-600 text-sm font-medium text-white',
          'transition hover:bg-violet-700 active:scale-[0.98]',
        )}
      >
        {data.buttonText}
      </button>
    </section>
  );
}
