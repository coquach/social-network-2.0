'use client';

import * as React from 'react';
import {
  BookOpen,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  useAdminResources,
  useCreateResource,
  useDeleteResource,
  useUpdateResource,
} from '@/hooks/admin/use-admin-intervention';
import {
  CreateInterventionResourceDTO,
  InterventionMediaType,
  InterventionResourceDTO,
  TargetRiskLevel,
} from '@/models/emotion/adminInterventionDTO';
import { EmotionResourceModal } from './emotion-resource-modal';

const MEDIA_TYPE_META: Record<
  InterventionMediaType,
  { label: string; icon: any; badgeClass: string }
> = {
  INFOGRAPHIC: {
    label: 'Infographic',
    icon: Layers,
    badgeClass: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  PDF_DOCUMENT: {
    label: 'Tài liệu PDF',
    icon: FileText,
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  IMAGE: {
    label: 'Hình ảnh',
    icon: ImageIcon,
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  VIDEO: {
    label: 'Video Clip',
    icon: Video,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  AUDIO: {
    label: 'Audio Thư giãn',
    icon: Headphones,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  EXTERNAL_LINK: {
    label: 'Bài viết ngoài',
    icon: Globe,
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-700',
  },
};

const RISK_LEVEL_META: Record<
  TargetRiskLevel,
  { label: string; badgeClass: string }
> = {
  MILD_STRESS: {
    label: 'Căng thẳng nhẹ',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  MODERATE_RISK: {
    label: 'Rủi ro vừa',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  HIGH_RISK: {
    label: 'Rủi ro cao',
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-800',
  },
  CRISIS: {
    label: 'Khủng hoảng',
    badgeClass: 'border-rose-200 bg-rose-100 text-rose-800 font-bold',
  },
};

export function EmotionResourcesManager() {
  const resourcesQuery = useAdminResources();
  const createResourceMutation = useCreateResource();
  const updateResourceMutation = useUpdateResource();
  const deleteResourceMutation = useDeleteResource();

  const [search, setSearch] = React.useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = React.useState<
    InterventionMediaType | 'all'
  >('all');
  const [riskFilter, setRiskFilter] = React.useState<
    TargetRiskLevel | 'all'
  >('all');
  const [statusFilter, setStatusFilter] = React.useState<
    'all' | 'active' | 'inactive'
  >('all');

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingResource, setEditingResource] =
    React.useState<InterventionResourceDTO | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const resources = resourcesQuery.data;

  const filteredResources = React.useMemo(() => {
    const list = resources ?? [];
    return list
      .filter((item) => {
        if (statusFilter === 'active' && !item.isActive) return false;
        if (statusFilter === 'inactive' && item.isActive) return false;
        if (mediaTypeFilter !== 'all' && item.mediaType !== mediaTypeFilter)
          return false;
        if (
          riskFilter !== 'all' &&
          !item.targetRiskLevels?.includes(riskFilter)
        )
          return false;

        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.sourceOrganization?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [resources, search, mediaTypeFilter, riskFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingResource(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (res: InterventionResourceDTO) => {
    setEditingResource(res);
    setModalOpen(true);
  };

  const handleSave = async (dto: CreateInterventionResourceDTO) => {
    if (editingResource) {
      await updateResourceMutation.mutateAsync({
        id: editingResource._id,
        dto,
      });
    } else {
      await createResourceMutation.mutateAsync(dto);
    }
    setModalOpen(false);
  };

  const handleToggleActive = async (
    res: InterventionResourceDTO,
    nextActive: boolean,
  ) => {
    await updateResourceMutation.mutateAsync({
      id: res._id,
      dto: { isActive: nextActive },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await deleteResourceMutation.mutateAsync(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề, nguồn y tế..."
              className="h-10 rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>

          <Select
            value={mediaTypeFilter}
            onValueChange={(val) => setMediaTypeFilter(val as any)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
              <SelectValue placeholder="Định dạng Media" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả định dạng</SelectItem>
              <SelectItem value="INFOGRAPHIC">Infographic</SelectItem>
              <SelectItem value="PDF_DOCUMENT">Tài liệu PDF</SelectItem>
              <SelectItem value="IMAGE">Hình ảnh</SelectItem>
              <SelectItem value="VIDEO">Video Clip</SelectItem>
              <SelectItem value="AUDIO">Audio Thư giãn</SelectItem>
              <SelectItem value="EXTERNAL_LINK">Bài viết ngoài</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={riskFilter}
            onValueChange={(val) => setRiskFilter(val as any)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
              <SelectValue placeholder="Mức độ áp dụng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="MILD_STRESS">Căng thẳng nhẹ</SelectItem>
              <SelectItem value="MODERATE_RISK">Rủi ro vừa</SelectItem>
              <SelectItem value="HIGH_RISK">Rủi ro cao</SelectItem>
              <SelectItem value="CRISIS">Khủng hoảng</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang kích hoạt</SelectItem>
              <SelectItem value="inactive">Đã tạm tắt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-500">
            Hiển thị <span className="font-semibold text-slate-800">{filteredResources.length}</span> tài liệu can thiệp
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void resourcesQuery.refetch()}
              disabled={resourcesQuery.isFetching}
              className="h-9 rounded-xl border-slate-200 text-xs"
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${resourcesQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Làm mới
            </Button>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="h-9 rounded-xl bg-sky-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Đăng Tài Liệu / Bài Tập Mới
            </Button>
          </div>
        </div>
      </div>

      {/* LIST CONTENT */}
      {resourcesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={`resource-skeleton-${index}`}
              className="rounded-2xl border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-600">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Chưa có tài liệu hay bài tập hỗ trợ nào
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {search || mediaTypeFilter !== 'all' || riskFilter !== 'all'
                ? 'Không tìm thấy tài liệu phù hợp với bộ lọc tìm kiếm.'
                : 'Đăng tải các bài tập thở, tài liệu y khoa thẩm định và audio thư giãn để hỗ trợ người dùng.'}
            </p>
            {!search && mediaTypeFilter === 'all' && riskFilter === 'all' && (
              <Button
                onClick={handleOpenCreate}
                className="mt-5 rounded-xl bg-sky-600 text-xs font-semibold text-white hover:bg-sky-700"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Đăng Tài Liệu Đầu Tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((item) => {
            const mediaMeta =
              MEDIA_TYPE_META[item.mediaType] || MEDIA_TYPE_META.INFOGRAPHIC;
            const MediaIcon = mediaMeta.icon;

            return (
              <Card
                key={item._id}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${mediaMeta.badgeClass}`}
                      >
                        <MediaIcon className="mr-1 h-3 w-3" />
                        {mediaMeta.label}
                      </Badge>

                      {item.sourceOrganization && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                          {item.sourceOrganization}
                        </span>
                      )}

                      {item.priority !== undefined && item.priority > 0 && (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-amber-700">
                          Ưu tiên #{item.priority}
                        </span>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(item)}
                          className="text-xs cursor-pointer"
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Chỉnh sửa tài liệu
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(item._id)}
                          className="text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-500" />
                          Xóa tài liệu
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-base font-bold tracking-tight text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="mt-1.5 line-clamp-3 text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Target Risk Levels Badges */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Áp dụng cho mức độ:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.targetRiskLevels?.map((level) => {
                        const meta = RISK_LEVEL_META[level] || {
                          label: level,
                          badgeClass: 'border-slate-200 bg-slate-50 text-slate-600',
                        };
                        return (
                          <Badge
                            key={level}
                            variant="outline"
                            className={`text-[10px] ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={item.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                    >
                      <Link2 className="h-3 w-3" />
                      Xem File Media
                    </a>

                    {item.referenceUrl && (
                      <a
                        href={item.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                      >
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                        Nguồn tham chiếu
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Switch */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-500">
                    Trạng thái kích hoạt
                  </span>
                  <Switch
                    checked={item.isActive ?? true}
                    onCheckedChange={(checked) => handleToggleActive(item, checked)}
                    disabled={updateResourceMutation.isPending}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <EmotionResourceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        resource={editingResource}
        onSubmit={handleSave}
        loading={createResourceMutation.isPending || updateResourceMutation.isPending}
      />

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Xác nhận xóa tài liệu hỗ trợ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Hành động này sẽ xóa tài liệu/bài tập này khỏi hệ thống. Người dùng sẽ không còn nhận được tài liệu này khi hệ thống đề xuất can thiệp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-xs">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteResourceMutation.isPending}
              className="rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {deleteResourceMutation.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
