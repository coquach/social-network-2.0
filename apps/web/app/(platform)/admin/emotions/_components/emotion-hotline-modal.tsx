'use client';

import * as React from 'react';
import { Clock, Globe, Loader2, Phone, PhoneCall, ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  CreateEmergencyHotlineDTO,
  EmergencyHotlineDTO,
} from '@/models/emotion/adminInterventionDTO';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotline: EmergencyHotlineDTO | null;
  onSubmit: (dto: CreateEmergencyHotlineDTO) => Promise<void>;
  loading?: boolean;
};

export function EmotionHotlineModal({
  open,
  onOpenChange,
  hotline,
  onSubmit,
  loading,
}: Props) {
  const isEditing = Boolean(hotline);

  const [organizationName, setOrganizationName] = React.useState('');
  const [hotlineNumber, setHotlineNumber] = React.useState('');
  const [is247, setIs247] = React.useState(true);
  const [startTime, setStartTime] = React.useState('08:00');
  const [endTime, setEndTime] = React.useState('20:00');
  const [displayNote, setDisplayNote] = React.useState(
    '24/7 (Tất cả các ngày trong tuần)',
  );
  const [description, setDescription] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [displayOrder, setDisplayOrder] = React.useState(1);
  const [isPrimary, setIsPrimary] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (hotline) {
      setOrganizationName(hotline.organizationName || '');
      setHotlineNumber(hotline.hotlineNumber || '');
      const h247 = hotline.is247 ?? hotline.operatingHoursConfig?.is247 ?? true;
      setIs247(h247);
      setStartTime(hotline.operatingHoursConfig?.startTime || '08:00');
      setEndTime(hotline.operatingHoursConfig?.endTime || '20:00');
      setDisplayNote(
        hotline.operatingHoursConfig?.displayNote ||
          hotline.operatingHours ||
          (h247 ? '24/7 (Tất cả các ngày trong tuần)' : '08:00 - 20:00'),
      );
      setDescription(hotline.description || '');
      setWebsiteUrl(hotline.websiteUrl || '');
      setDisplayOrder(hotline.displayOrder ?? 1);
      setIsPrimary(hotline.isPrimary ?? false);
      setIsActive(hotline.isActive ?? true);
    } else {
      setOrganizationName('');
      setHotlineNumber('');
      setIs247(true);
      setStartTime('08:00');
      setEndTime('20:00');
      setDisplayNote('24/7 (Tất cả các ngày trong tuần)');
      setDescription('');
      setWebsiteUrl('');
      setDisplayOrder(1);
      setIsPrimary(false);
      setIsActive(true);
    }
  }, [hotline, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationName.trim() || !hotlineNumber.trim()) return;

    const dto: CreateEmergencyHotlineDTO = {
      organizationName: organizationName.trim(),
      hotlineNumber: hotlineNumber.trim(),
      is247,
      operatingHours: displayNote.trim() || (is247 ? '24/7' : `${startTime} - ${endTime}`),
      operatingHoursConfig: {
        is247,
        startTime: !is247 ? startTime : undefined,
        endTime: !is247 ? endTime : undefined,
        displayNote: displayNote.trim(),
      },
      description: description.trim() || undefined,
      websiteUrl: websiteUrl.trim() || undefined,
      displayOrder: Number(displayOrder) || 1,
      isPrimary,
      isActive,
    };

    await onSubmit(dto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl p-0">
        <div className="border-b border-slate-100 bg-linear-to-r from-sky-50 via-slate-50 to-white px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-2 text-sky-600">
                <PhoneCall className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Cập nhật Hotline' : 'Thêm Đường Dây Nóng'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Đường dây nóng khẩn cấp hỗ trợ người dùng khi gặp khủng hoảng tâm lý hoặc cảm xúc tiêu cực kéo dài.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4 text-sm">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Tên Đơn vị / Tổ chức <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Ví dụ: Hotline Ngày Mai, Viện Sức Khỏe Tâm Thần..."
              required
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Số điện thoại khẩn cấp <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={hotlineNumber}
                onChange={(e) => setHotlineNumber(e.target.value)}
                placeholder="Ví dụ: 096 306 1414 hoặc 1900 6000"
                required
                className="rounded-xl border-slate-200 pl-9 font-mono font-medium"
              />
            </div>
          </div>

          {/* Operating Hours Config */}
          <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-900">
                <Clock className="h-4 w-4 text-sky-600" />
                Khung giờ hoạt động
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="hotline-247"
                  checked={is247}
                  onCheckedChange={(checked) => {
                    setIs247(checked);
                    if (checked) {
                      setDisplayNote('24/7 (Tất cả các ngày trong tuần)');
                    } else {
                      setDisplayNote(`${startTime} - ${endTime} (Hàng ngày)`);
                    }
                  }}
                />
                <Label htmlFor="hotline-247" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Trực 24/7
                </Label>
              </div>
            </div>

            {!is247 && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Giờ mở cửa
                  </Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setDisplayNote(`${e.target.value} - ${endTime} (Hàng ngày)`);
                    }}
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Giờ đóng cửa
                  </Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setDisplayNote(`${startTime} - ${e.target.value} (Hàng ngày)`);
                    }}
                    className="h-9 rounded-xl border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-slate-600">
                Ghi chú khung giờ hiển thị cho người dùng
              </Label>
              <Input
                value={displayNote}
                onChange={(e) => setDisplayNote(e.target.value)}
                placeholder="Ví dụ: 24/7 hoặc 08:00 - 20:00 (Thứ 2 - Thứ 7)"
                className="h-9 rounded-xl border-slate-200 bg-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Mô tả tóm tắt dịch vụ
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tư vấn tâm lý, hỗ trợ giải tỏa áp lực và ngăn ngừa khủng hoảng..."
              rows={2}
              className="resize-none rounded-xl border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Website chính thức (URL)
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://ngaymai.vn"
                  className="rounded-xl border-slate-200 pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Thứ tự ưu tiên hiển thị
              </Label>
              <Input
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value) || 1)}
                className="rounded-xl border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hotline-primary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(Boolean(checked))}
              />
              <Label
                htmlFor="hotline-primary"
                className="flex items-center gap-1 text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                Hotline ưu tiên hàng đầu (Primary)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hotline-active-toggle"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label
                htmlFor="hotline-active-toggle"
                className="text-xs font-medium text-slate-700 cursor-pointer"
              >
                {isActive ? 'Đang kích hoạt' : 'Tạm tắt'}
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-slate-200"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || !organizationName.trim() || !hotlineNumber.trim()}
              className="rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Lưu Thay Đổi' : 'Thêm Hotline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
