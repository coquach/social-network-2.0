'use client';

import {
  buildDestinationHref,
  chatbotService,
  type AssistantSuggestedActionDTO,
} from '@repo/shared';
import { ArrowRight, Search } from 'lucide-react';
import { useRef } from 'react';

type AssistantActionButtonsProps = {
  actions: AssistantSuggestedActionDTO[];
  onNavigate: (href: string) => void;
};

export function AssistantActionButtons({ actions, onNavigate }: AssistantActionButtonsProps) {
  // Click telemetry is recorded once per action even if the user taps repeatedly.
  const recordedActionIds = useRef<Set<string>>(new Set());

  const items = actions.flatMap((action) => {
    const href = buildDestinationHref(action.payload.destinationId, action.payload.params, 'web');
    return href ? [{ action, href }] : [];
  });
  if (items.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 pt-1 border-t border-border/40" role="group" aria-label="Gợi ý điều hướng">
      {items.map(({ action, href }) => {
        const isSearch = action.payload.destinationId === 'search';
        return (
          <button
            key={action.id}
            type="button"
            aria-label={`Chuyển tới ${action.label}`}
            onClick={() => {
              if (!recordedActionIds.current.has(action.id)) {
                recordedActionIds.current.add(action.id);
                void chatbotService.recordActionClick(action.id, action.payload.destinationId);
              }
              onNavigate(href);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition cursor-pointer active:scale-95 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            <span>{action.label}</span>
            {isSearch ? <Search size={12} className="shrink-0" /> : <ArrowRight size={12} className="shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
