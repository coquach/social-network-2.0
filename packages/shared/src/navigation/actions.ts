import type {
  AssistantNavigateAction,
  AssistantShowCardAction,
} from '../types/chatbot.types';

export const isNavigateAction = (value: unknown): value is AssistantNavigateAction => {
  if (!value || typeof value !== 'object') return false;
  const action = value as Partial<AssistantNavigateAction>;
  return (
    action.type === 'navigate' &&
    typeof action.id === 'string' &&
    typeof action.label === 'string' &&
    typeof action.payload?.destinationId === 'string'
  );
};

export const isShowCardAction = (value: unknown): value is AssistantShowCardAction => {
  if (!value || typeof value !== 'object') return false;
  const action = value as Partial<AssistantShowCardAction>;
  return (
    action.type === 'show_card' &&
    typeof action.id === 'string' &&
    typeof action.payload === 'object' &&
    action.payload !== null &&
    typeof (action.payload as { cardType?: unknown }).cardType === 'string' &&
    typeof (action.payload as { title?: unknown }).title === 'string'
  );
};

/**
 * Reads navigation actions from a chat message's `metadata`.
 * Metadata crosses a network/storage boundary, so it is validated rather than cast.
 */
export const getAssistantMessageActions = (
  metadata: unknown,
): AssistantNavigateAction[] => {
  const raw = (metadata as { actions?: unknown } | null | undefined)?.actions;
  return Array.isArray(raw) ? raw.filter(isNavigateAction) : [];
};

/**
 * Reads mini cards from a chat message's `metadata`.
 * Supports both dedicated `cards` field and fallback `actions` list.
 */
export const getAssistantMessageCards = (
  metadata: unknown,
): AssistantShowCardAction[] => {
  if (!metadata || typeof metadata !== 'object') return [];
  const meta = metadata as { cards?: unknown; actions?: unknown };
  if (Array.isArray(meta.cards)) {
    const fromCards = meta.cards.filter(isShowCardAction);
    if (fromCards.length > 0) return fromCards;
  }
  if (Array.isArray(meta.actions)) {
    return meta.actions.filter(isShowCardAction);
  }
  return [];
};
