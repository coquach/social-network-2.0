import type {
  AssistantNavigateAction,
  AssistantProposeAction,
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

export const isProposeAction = (value: unknown): value is AssistantProposeAction => {
  if (!value || typeof value !== 'object') return false;
  const action = value as Partial<AssistantProposeAction>;
  const payload = action.payload as Record<string, unknown> | null | undefined;
  return (
    action.type === 'propose_action' &&
    typeof action.id === 'string' &&
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.actionName === 'string' &&
    typeof payload.idempotencyKey === 'string' &&
    (payload.proposalToken == null || typeof payload.proposalToken === 'string') &&
    (payload.conversationId == null || typeof payload.conversationId === 'string')
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

/**
 * Reads action proposals (write confirmation cards) from a chat message's `metadata`.
 */
export const getAssistantProposeActions = (
  metadata: unknown,
): AssistantProposeAction[] => {
  if (!metadata || typeof metadata !== 'object') return [];
  const meta = metadata as { proposals?: unknown; actions?: unknown };
  if (Array.isArray(meta.proposals)) {
    const fromProposals = meta.proposals.filter(isProposeAction);
    if (fromProposals.length > 0) return fromProposals;
  }
  if (Array.isArray(meta.actions)) {
    return meta.actions.filter(isProposeAction);
  }
  return [];
};

export interface ProposalExecutionContext {
  proposalToken: string | undefined;
  conversationId: string | undefined;
  isExpired: boolean;
  isMissingToken: boolean;
  canExecute: boolean;
}

/**
 * Resolves the execution token and conversation binding for a proposed action.
 * Legacy persisted proposals without a token or expired proposals cannot be executed.
 */
export const resolveProposalExecutionContext = (
  proposal: AssistantProposeAction,
  fallbackConversationId?: string,
): ProposalExecutionContext => {
  const proposalToken = proposal.payload.proposalToken?.trim() || undefined;
  const rawConversationId =
    proposal.payload.conversationId?.trim() || fallbackConversationId?.trim() || undefined;
  const conversationId = rawConversationId && rawConversationId !== 'new' ? rawConversationId : undefined;

  const expiresAtMs = proposal.payload.expiresAt ? Date.parse(proposal.payload.expiresAt) : Number.NaN;
  const isExpired = Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now();
  const isMissingToken = !proposalToken;

  return {
    proposalToken,
    conversationId,
    isExpired,
    isMissingToken,
    canExecute: Boolean(proposalToken && conversationId && !isExpired),
  };
};

/**
 * Returns true when an action execution error indicates a permanent token,
 * expiry, or conversation-binding rejection that retrying cannot resolve.
 */
export const isNonRetryableProposalError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const err = error as { status?: unknown; response?: { status?: unknown } };
  const status = typeof err.status === 'number' ? err.status : err.response?.status;
  return status === 400 || status === 401 || status === 403 || status === 410;
};

export type PolicyBlockBannerState = 'user_restricted' | 'server_degraded' | null;

/**
 * Determines which policy-blocked banner (if any) to render for an assistant message.
 * Decouples server fail-closed RESTRICTED states from the user's cached aiPolicy setting.
 */
export const getPolicyBlockBannerState = (
  content: string,
  metadata: unknown,
  userAiPolicy?: string,
): PolicyBlockBannerState => {
  const isUserRestricted = userAiPolicy === 'RESTRICTED';
  const metaBlocked =
    Boolean(metadata && typeof metadata === 'object' && (metadata as { policyBlocked?: unknown }).policyBlocked === true);

  if (metaBlocked) {
    return isUserRestricted ? 'user_restricted' : 'server_degraded';
  }

  if (isUserRestricted) {
    const normalized = (content ?? '').toLowerCase();
    if (
      normalized.includes('riêng tư tối đa') ||
      normalized.includes('quyền riêng tư') ||
      normalized.includes('không thể truy cập') ||
      normalized.includes('không thể thực hiện thao tác')
    ) {
      return 'user_restricted';
    }
  }

  return null;
};
