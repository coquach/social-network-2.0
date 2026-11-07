'use client';

import React, { useState } from 'react';
import type { AssistantProposeAction, ExecuteActionResultDTO } from '@repo/shared';
import { chatbotService } from '@repo/shared';
import {
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  Ban,
  Users,
  Heart,
  CheckCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ActionConfirmationCardProps {
  proposals: AssistantProposeAction[];
  onExecuted?: (result: ExecuteActionResultDTO) => void;
  onStatusChange?: (
    key: string,
    status: 'idle' | 'executing' | 'success' | 'cancelled' | 'error',
    message?: string,
  ) => void;
}

type CardStatus = 'idle' | 'executing' | 'success' | 'cancelled' | 'error';

interface ActionState {
  status: CardStatus;
  message?: string;
}

export function ActionConfirmationCard({
  proposals,
  onExecuted,
  onStatusChange,
}: ActionConfirmationCardProps) {
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>(() => {
    const initial: Record<string, ActionState> = {};
    for (const p of proposals || []) {
      const key = p.payload?.idempotencyKey || p.id;
      if (p.payload?.status) {
        initial[key] = {
          status: p.payload.status,
          message: p.payload.executionResult?.message,
        };
      }
    }
    return initial;
  });

  if (!proposals || proposals.length === 0) return null;

  const handleConfirm = async (proposal: AssistantProposeAction) => {
    const key = proposal.payload.idempotencyKey || proposal.id;
    setActionStates((prev) => ({
      ...prev,
      [key]: { status: 'executing' },
    }));
    onStatusChange?.(key, 'executing');

    try {
      const result = await chatbotService.executeAction({
        actionId: proposal.id,
        actionName: proposal.payload.actionName,
        params: proposal.payload.params,
        idempotencyKey: proposal.payload.idempotencyKey,
      });

      if (result.success) {
        const msg = result.message || 'Thao tác đã được thực hiện thành công.';
        setActionStates((prev) => ({
          ...prev,
          [key]: {
            status: 'success',
            message: msg,
          },
        }));
        onStatusChange?.(key, 'success', msg);
        toast.success(result.message || 'Thực hiện thành công!');
        onExecuted?.(result);
      } else {
        const msg = result.message || 'Không thể thực hiện thao tác.';
        setActionStates((prev) => ({
          ...prev,
          [key]: {
            status: 'error',
            message: msg,
          },
        }));
        onStatusChange?.(key, 'error', msg);
        toast.error(result.message || 'Có lỗi xảy ra khi thực hiện.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ.';
      setActionStates((prev) => ({
        ...prev,
        [key]: {
          status: 'error',
          message: errMsg,
        },
      }));
      onStatusChange?.(key, 'error', errMsg);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu thực thi.');
    }
  };

  const handleCancel = (proposal: AssistantProposeAction) => {
    const key = proposal.payload.idempotencyKey || proposal.id;
    setActionStates((prev) => ({
      ...prev,
      [key]: {
        status: 'cancelled',
        message: 'Đã hủy thao tác.',
      },
    }));
    onStatusChange?.(key, 'cancelled', 'Đã hủy thao tác.');
  };

  const renderIcon = (actionName: string, category?: string) => {
    switch (actionName) {
      case 'send_friend_request':
        return <UserPlus size={18} className="text-primary" />;
      case 'accept_friend_request':
        return <UserCheck size={18} className="text-emerald-500" />;
      case 'decline_friend_request':
      case 'cancel_friend_request':
        return <UserX size={18} className="text-amber-500" />;
      case 'unfriend_user':
        return <UserMinus size={18} className="text-rose-500" />;
      case 'block_user':
        return <Ban size={18} className="text-rose-600" />;
      case 'join_group':
      case 'leave_group':
        return <Users size={18} className="text-indigo-500" />;
      case 'react_post':
        return <Heart size={18} className="text-rose-500 fill-rose-500/20" />;
      case 'mark_all_notifications_read':
        return <CheckCheck size={18} className="text-sky-500" />;
      default:
        if (category === 'social') return <UserPlus size={18} className="text-primary" />;
        if (category === 'group') return <Users size={18} className="text-indigo-500" />;
        if (category === 'content') return <Heart size={18} className="text-rose-500" />;
        if (category === 'notification') return <CheckCheck size={18} className="text-sky-500" />;
        return <Sparkles size={18} className="text-primary" />;
    }
  };

  return (
    <div
      className="mt-3 space-y-2.5 pt-2 border-t border-border/40"
      role="region"
      aria-label="Xác nhận thao tác"
    >
      {proposals.map((proposal) => {
        const key = proposal.payload.idempotencyKey || proposal.id;
        const current = actionStates[key] || { status: 'idle' };
        const { actionName, title, description, confirmLabel, cancelLabel, category, isDestructive } = proposal.payload;

        return (
          <div
            key={key}
            className={`rounded-xl border p-3 shadow-xs transition-all ${
              isDestructive
                ? 'border-destructive/30 bg-destructive/[0.03] dark:bg-destructive/[0.08]'
                : 'border-primary/25 bg-primary/[0.04] dark:bg-primary/[0.08]'
            }`}
          >
            {/* Header: Icon & Information */}
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 rounded-lg bg-background p-2 border border-border/80 shadow-2xs shrink-0">
                {renderIcon(actionName, category)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-foreground tracking-tight">
                  {title}
                </h4>
                {description && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Status and Action Buttons */}
            <div className="mt-3 flex items-center justify-end gap-2">
              {current.status === 'idle' && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-background/80 cursor-pointer"
                    onClick={() => handleCancel(proposal)}
                  >
                    {cancelLabel || 'Hủy'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={isDestructive ? 'destructive' : 'default'}
                    className="h-7 px-3 text-xs font-medium cursor-pointer"
                    onClick={() => handleConfirm(proposal)}
                  >
                    {confirmLabel || 'Xác nhận'}
                  </Button>
                </>
              )}

              {current.status === 'executing' && (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium py-1">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span>Đang thực hiện...</span>
                </div>
              )}

              {current.status === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium py-0.5">
                  <CheckCircle2 size={15} />
                  <span>{current.message || 'Đã hoàn tất'}</span>
                </div>
              )}

              {current.status === 'cancelled' && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-0.5">
                  <XCircle size={15} />
                  <span>Đã hủy thao tác</span>
                </div>
              )}

              {current.status === 'error' && (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle size={14} />
                    <span className="truncate max-w-[190px]">{current.message}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1 cursor-pointer"
                    onClick={() => handleConfirm(proposal)}
                  >
                    <RotateCcw size={11} />
                    Thử lại
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
