import type {
  AssistantNavigateAction,
  AssistantSuggestedActionDTO,
} from '../types/chatbot.types';

const isNavigateAction = (value: unknown): value is AssistantNavigateAction => {
  if (!value || typeof value !== 'object') return false;
  const action = value as Partial<AssistantNavigateAction>;
  return (
    action.type === 'navigate' &&
    typeof action.id === 'string' &&
    typeof action.label === 'string' &&
    typeof action.payload?.destinationId === 'string'
  );
};

/**
 * Reads navigation actions from a chat message's `metadata`.
 * Metadata crosses a network/storage boundary, so it is validated rather than cast.
 */
export const getAssistantMessageActions = (
  metadata: unknown,
): AssistantSuggestedActionDTO[] => {
  const raw = (metadata as { actions?: unknown } | null | undefined)?.actions;
  return Array.isArray(raw) ? raw.filter(isNavigateAction) : [];
};
