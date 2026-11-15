import { describe, expect, it, beforeEach } from 'vitest';
import {
  getPolicyBlockBannerState,
  isNonRetryableProposalError,
  isProposeAction,
  resolveProposalExecutionContext,
} from '../actions';
import { extractProactiveCheckinContext, useAssistantStore } from '../../store/useAssistantStore';
import { getNotificationRoute } from '../../utils/notification-routes';
import type { AssistantProposeAction } from '../../types/chatbot.types';

const makeProposal = (
  overrides: Partial<AssistantProposeAction['payload']> = {},
): AssistantProposeAction => ({
  type: 'propose_action',
  id: 'prop-1',
  label: 'Confirm',
  payload: {
    actionName: 'join_group',
    title: 'Join group',
    description: 'Join test group',
    params: { groupId: 'g-1' },
    idempotencyKey: 'idem-1',
    ...overrides,
  },
});

describe('Chatbot hardening shared helpers', () => {
  it('accepts null/undefined proposalToken and conversationId in isProposeAction for legacy compatibility', () => {
    expect(isProposeAction(makeProposal())).toBe(true);
    expect(
      isProposeAction({
        ...makeProposal(),
        payload: {
          ...makeProposal().payload,
          proposalToken: null,
          conversationId: null,
        },
      }),
    ).toBe(true);
    expect(
      isProposeAction({
        ...makeProposal(),
        payload: {
          ...makeProposal().payload,
          proposalToken: 123,
        },
      }),
    ).toBe(false);
  });

  it('resolves proposal execution context, rejects missing token, expired token, and "new" conversationId', () => {
    const valid = resolveProposalExecutionContext(
      makeProposal({
        proposalToken: 'tok-123',
        conversationId: 'conv-1',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      }),
    );
    expect(valid.canExecute).toBe(true);
    expect(valid.proposalToken).toBe('tok-123');
    expect(valid.conversationId).toBe('conv-1');

    const fallbackConv = resolveProposalExecutionContext(
      makeProposal({ proposalToken: 'tok-123' }),
      'conv-fallback',
    );
    expect(fallbackConv.canExecute).toBe(true);
    expect(fallbackConv.conversationId).toBe('conv-fallback');

    const newDraftConv = resolveProposalExecutionContext(
      makeProposal({ proposalToken: 'tok-123' }),
      'new',
    );
    expect(newDraftConv.canExecute).toBe(false);
    expect(newDraftConv.conversationId).toBeUndefined();

    const missingToken = resolveProposalExecutionContext(makeProposal(), 'conv-1');
    expect(missingToken.canExecute).toBe(false);
    expect(missingToken.isMissingToken).toBe(true);

    const expired = resolveProposalExecutionContext(
      makeProposal({
        proposalToken: 'tok-123',
        conversationId: 'conv-1',
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
      }),
    );
    expect(expired.canExecute).toBe(false);
    expect(expired.isExpired).toBe(true);
  });

  it('classifies 400/401/403/410 as non-retryable proposal errors', () => {
    expect(isNonRetryableProposalError({ status: 400 })).toBe(true);
    expect(isNonRetryableProposalError({ status: 401 })).toBe(true);
    expect(isNonRetryableProposalError({ response: { status: 403 } })).toBe(true);
    expect(isNonRetryableProposalError({ response: { status: 410 } })).toBe(true);
    expect(isNonRetryableProposalError({ response: { status: 500 } })).toBe(false);
    expect(isNonRetryableProposalError(new Error('Network error'))).toBe(false);
  });

  it('decouples policyBlocked banner state from client-side aiPolicy', () => {
    expect(
      getPolicyBlockBannerState('Any reply', { policyBlocked: true }, 'FULL'),
    ).toBe('server_degraded');
    expect(
      getPolicyBlockBannerState('Any reply', { policyBlocked: true }, 'RESTRICTED'),
    ).toBe('user_restricted');
    expect(
      getPolicyBlockBannerState('Any reply', { policyBlocked: false }, 'FULL'),
    ).toBeNull();
    expect(
      getPolicyBlockBannerState(undefined as unknown as string, {}, 'RESTRICTED'),
    ).toBeNull();
  });
});

describe('Proactive check-in store & notification routing', () => {
  beforeEach(() => {
    useAssistantStore.setState({ pendingProactiveContext: null, openRequestSeq: 0 });
  });

  it('extracts proactive check-in context and updates assistant store', () => {
    const ctx = extractProactiveCheckinContext({
      _id: 'notif-1',
      type: 'proactive_intervention',
      payload: {
        chatbotPromptContext: 'Hôm nay bạn cảm thấy thế nào?',
      },
    });
    expect(ctx).toEqual({
      interventionId: 'notif-1',
      promptContext: 'Hôm nay bạn cảm thấy thế nào?',
    });

    expect(extractProactiveCheckinContext({ _id: 'n-2', type: 'reaction' })).toBeNull();

    useAssistantStore.getState().openWithProactiveContext(ctx!);
    expect(useAssistantStore.getState().pendingProactiveContext).toEqual(ctx);
    expect(useAssistantStore.getState().openRequestSeq).toBe(1);

    useAssistantStore.getState().consumeProactiveContext();
    expect(useAssistantStore.getState().pendingProactiveContext).toBeNull();
  });

  it('routes proactive_intervention notifications for web and native', () => {
    expect(getNotificationRoute({ type: 'proactive_intervention' }, 'web')).toBe('/emotions');
    expect(getNotificationRoute({ type: 'proactive_intervention' }, 'native')).toBe('/(main)/sentiment');
  });
});
