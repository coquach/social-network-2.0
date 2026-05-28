'use client';

import { AvatarWithName } from '@/components/avatar';
import PostMedia from '@/components/post/post-media';
import { TextCollapse } from '@/components/text-collapse';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AnalysisSummaryDto,
  CommentDTO,
  PostDTO,
  TargetType,
} from '@repo/shared';
import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

const contentShellClass =
  'overflow-hidden border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md';

const TARGET_LABELS: Record<TargetType, string> = {
  [TargetType.POST]: 'Bài viết',
  [TargetType.COMMENT]: 'Bình luận',
  [TargetType.SHARE]: 'Nội dung chia sẻ',
};

const formatRelativeTime = (value?: Date) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: vi,
  });
};

const isPostSummary = (
  summary: AnalysisSummaryDto,
): summary is AnalysisSummaryDto & {
  targetType: TargetType.POST;
  content: PostDTO;
} => summary.targetType === TargetType.POST;

const isCommentSummary = (
  summary: AnalysisSummaryDto,
): summary is AnalysisSummaryDto & {
  targetType: TargetType.COMMENT;
  content: CommentDTO;
} => summary.targetType === TargetType.COMMENT;

const ContentCardShell = ({
  title,
  label,
  children,
  className,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={cn(contentShellClass, className)}>
    <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge
            variant="secondary"
            className="w-fit rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100"
          >
            {label}
          </Badge>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Nội dung được phân tích
            </h2>

            <p className="text-sm text-slate-500">
              Xem nội dung gốc và ngữ cảnh cảm xúc
            </p>
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent className="p-4 sm:p-5">{children}</CardContent>
  </Card>
);

const PostContentPreview = ({ content }: { content: PostDTO }) => {
  const router = useRouter();
  const createdAt = formatRelativeTime(content.createdAt);

  return (
    <ContentCardShell
      title={content.group?.name ? content.group.name : 'Bài viết'}
      label={TARGET_LABELS[TargetType.POST]}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AvatarWithName
            userId={content.userId}
            size="large"
            hasBorder
            className="min-w-0"
          />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {createdAt ? <span>{createdAt}</span> : null}
            <span className="text-slate-300">•</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
              Bài viết gốc
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50/80 p-4 sm:p-5">
          <TextCollapse
            text={content.content}
            maxLength={280}
            className="min-w-0"
            textClassName="text-[15px] leading-7 text-slate-900 sm:text-[16px]"
            buttonClassName="text-sm"
          />
        </div>

        <PostMedia
          media={content.media}
          onClick={() => router.push(`/posts/${content.id}`)}
        />
      </div>
    </ContentCardShell>
  );
};

const CommentContentPreview = ({ content }: { content: CommentDTO }) => {
  const createdAt = formatRelativeTime(content.createdAt);

  return (
    <ContentCardShell
      title="Bình luận"
      label={TARGET_LABELS[TargetType.COMMENT]}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AvatarWithName
            userId={content.userId}
            size="medium"
            hasBorder
            className="min-w-0"
          />

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {createdAt ? <span>{createdAt}</span> : null}
            <span className="text-slate-300">•</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600">
              Bình luận gốc
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50/80 p-4 sm:p-5">
          <TextCollapse
            text={content.content}
            maxLength={240}
            className="min-w-0"
            textClassName="text-[15px] leading-7 text-slate-900 sm:text-[16px]"
            buttonClassName="text-sm"
          />
        </div>

        <PostMedia media={content.media ? [content.media] : undefined} />
      </div>
    </ContentCardShell>
  );
};

const UnsupportedContentPreview = ({
  targetType,
}: {
  targetType: TargetType;
}) => (
  <ContentCardShell title="Nội dung gốc" label={TARGET_LABELS[targetType]}>
    <p className="text-sm leading-6 text-slate-600">
      Loại nội dung này chưa có bản xem trước riêng.
    </p>
  </ContentCardShell>
);

export const EmotionContentPreview = ({
  summary,
}: {
  summary: AnalysisSummaryDto;
}) => {
  if (isPostSummary(summary)) {
    return <PostContentPreview content={summary.content} />;
  }

  if (isCommentSummary(summary)) {
    return <CommentContentPreview content={summary.content} />;
  }

  return <UnsupportedContentPreview targetType={summary.targetType} />;
};
