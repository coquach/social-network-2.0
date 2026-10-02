'use client';

import * as React from 'react';
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  MoreVertical,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  useAdminHotlines,
  useCreateHotline,
  useDeleteHotline,
  useUpdateHotline,
} from '@/hooks/admin/use-admin-intervention';
import {
  CreateEmergencyHotlineDTO,
  EmergencyHotlineDTO,
} from '@/models/emotion/adminInterventionDTO';
import { EmotionHotlineModal } from './emotion-hotline-modal';

export function EmotionHotlinesManager() {
  const hotlinesQuery = useAdminHotlines();
  const createHotlineMutation = useCreateHotline();
  const updateHotlineMutation = useUpdateHotline();
  const deleteHotlineMutation = useDeleteHotline();

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingHotline, setEditingHotline] = React.useState<EmergencyHotlineDTO | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const hotlines = hotlinesQuery.data;

  const filteredHotlines = React.useMemo(() => {
    const list = hotlines ?? [];
    return list
      .filter((item) => {
        if (statusFilter === 'active' && !item.isActive) return false;
        if (statusFilter === 'inactive' && item.isActive) return false;

        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          item.organizationName?.toLowerCase().includes(query) ||
          item.hotlineNumber?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
        return (a.displayOrder ?? 1) - (b.displayOrder ?? 1);
      });
  }, [hotlines, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingHotline(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (hotline: EmergencyHotlineDTO) => {
    setEditingHotline(hotline);
    setModalOpen(true);
  };

  const handleSave = async (dto: CreateEmergencyHotlineDTO) => {
    if (editingHotline) {
      await updateHotlineMutation.mutateAsync({
        id: editingHotline._id,
        dto,
      });
    } else {
      await createHotlineMutation.mutateAsync(dto);
    }
    setModalOpen(false);
  };

  const handleToggleActive = async (hotline: EmergencyHotlineDTO, nextActive: boolean) => {
    await updateHotlineMutation.mutateAsync({
      id: hotline._id,
      dto: { isActive: nextActive },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    await deleteHotlineMutation.mutateAsync(deletingId);
    setDeletingId(null);
  };

  const handleCopyPhone = (number: string, id: string) => {
    navigator.clipboard.writeText(number);
    setCopiedId(id);
    toast.success(`Đã sao chép số hotline: ${number}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên tổ chức, số hotline..."
              className="h-10 rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="h-10 w-[160px] rounded-xl border-slate-200 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang kích hoạt</SelectItem>
              <SelectItem value="inactive">Đã tạm tắt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void hotlinesQuery.refetch()}
            disabled={hotlinesQuery.isFetching}
            className="h-10 rounded-xl border-slate-200 text-xs"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${hotlinesQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Làm mới
          </Button>

          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="h-10 rounded-xl bg-sky-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm Hotline
          </Button>
        </div>
      </div>

      {/* LIST CONTENT */}
      {hotlinesQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={`hotline-skeleton-${index}`}
              className="rounded-2xl border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredHotlines.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-600">
              <PhoneCall className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Chưa có đường dây nóng nào
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {search || statusFilter !== 'all'
                ? 'Không tìm thấy hotline phù hợp với bộ lọc tìm kiếm.'
                : 'Thêm hotline cứu trợ và hỗ trợ tâm lý để người dùng có thể liên hệ ngay khi nguy cấp.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button
                onClick={handleOpenCreate}
                className="mt-5 rounded-xl bg-sky-600 text-xs font-semibold text-white hover:bg-sky-700"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm Hotline Đầu Tiên
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHotlines.map((item) => {
            const is247 = item.is247 ?? item.operatingHoursConfig?.is247 ?? true;
            const operatingHoursText =
              item.operatingHoursConfig?.displayNote ||
              item.operatingHours ||
              (is247 ? 'Trực 24/7' : 'Giờ hành chính');

            return (
              <Card
                key={item._id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
                  item.isPrimary
                    ? 'border-amber-200 bg-linear-to-b from-amber-50/40 via-white to-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  {/* Top tags and actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.isPrimary && (
                        <Badge className="border-amber-200 bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <ShieldAlert className="mr-1 h-3 w-3 text-amber-600" />
                          Ưu tiên hàng đầu
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          item.isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-500'
                        }`}
                      >
                        {item.isActive ? 'Đang hoạt động' : 'Tạm tắt'}
                      </Badge>
                      {item.displayOrder !== undefined && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                          #{item.displayOrder}
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
                          Chỉnh sửa thông tin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingId(item._id)}
                          className="text-xs text-rose-600 focus:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-500" />
                          Xóa hotline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Organization Title */}
                  <div>
                    <h4 className="text-base font-bold tracking-tight text-slate-900">
                      {item.organizationName}
                    </h4>
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Hotkey Phone Badge Box */}
                  <div className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider">
                          Đường dây nóng
                        </div>
                        <a
                          href={`tel:${item.hotlineNumber.replace(/\s+/g, '')}`}
                          className="text-sm font-bold font-mono text-slate-900 hover:text-sky-600 hover:underline"
                        >
                          {item.hotlineNumber}
                        </a>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyPhone(item.hotlineNumber, item._id)}
                      className="h-8 w-8 rounded-lg text-sky-700 hover:bg-sky-100/80"
                      title="Sao chép số"
                    >
                      {copiedId === item._id ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-col gap-1.5 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">{operatingHoursText}</span>
                    </div>

                    {item.websiteUrl && (
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-sky-600 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[220px]">
                          {item.websiteUrl.replace(/^https?:\/\//, '')}
                        </span>
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
                    disabled={updateHotlineMutation.isPending}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      <EmotionHotlineModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        hotline={editingHotline}
        onSubmit={handleSave}
        loading={createHotlineMutation.isPending || updateHotlineMutation.isPending}
      />

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Xác nhận xóa đường dây nóng?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Hành động này sẽ xóa hotline này khỏi hệ thống. Người dùng sẽ không thể nhìn thấy số liên lạc này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 text-xs">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteHotlineMutation.isPending}
              className="rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {deleteHotlineMutation.isPending && (
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
