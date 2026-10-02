'use client';

import * as React from 'react';
import {
  BookOpen,
  FileText,
  Globe,
  Headphones,
  Image as ImageIcon,
  Layers,
  Link2,
  Loader2,
  Video,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  CreateInterventionResourceDTO,
  InterventionMediaType,
  InterventionResourceDTO,
  TargetRiskLevel,
} from '@/models/emotion/adminInterventionDTO';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: InterventionResourceDTO | null;
  onSubmit: (dto: CreateInterventionResourceDTO) => Promise<void>;
  loading?: boolean;
};

const RISK_LEVELS: { value: TargetRiskLevel; label: string; desc: string }[] = [
  {
    value: 'MILD_STRESS',
    label: 'Căng thẳng nhẹ (MILD_STRESS)',
    desc: 'Người dùng có cảm xúc mệt mỏi hoặc lo lắng nhẹ',
  },
  {
    value: 'MODERATE_RISK',
    label: 'Rủi ro vừa (MODERATE_RISK)',
    desc: 'Cảm xúc tiêu cực diễn ra liên tục nhiều ngày',
  },
  {
    value: 'HIGH_RISK',
    label: 'Rủi ro cao (HIGH_RISK)',
    desc: 'Nguy cơ trầm cảm hoặc kiệt quệ cảm xúc',
  },
  {
    value: 'CRISIS',
    label: 'Khủng hoảng (CRISIS)',
    desc: 'Cần can thiệp khẩn cấp tức thời',
  },
];

const MEDIA_TYPES: {
  value: InterventionMediaType;
  label: string;
  icon: any;
}[] = [
  { value: 'INFOGRAPHIC', label: 'Infographic (Ảnh đồ họa thông tin)', icon: Layers },
  { value: 'PDF_DOCUMENT', label: 'PDF Document (Tài liệu hướng dẫn PDF)', icon: FileText },
  { value: 'IMAGE', label: 'Hình ảnh (Image)', icon: ImageIcon },
  { value: 'VIDEO', label: 'Video hướng dẫn (Clip)', icon: Video },
  { value: 'AUDIO', label: 'Audio dẫn thiền / Thư giãn', icon: Headphones },
  { value: 'EXTERNAL_LINK', label: 'Liên kết bài viết y khoa ngoài', icon: Globe },
];

export function EmotionResourceModal({
  open,
  onOpenChange,
  resource,
  onSubmit,
  loading,
}: Props) {
  const isEditing = Boolean(resource);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [sourceOrganization, setSourceOrganization] = React.useState('');
  const [mediaType, setMediaType] =
    React.useState<InterventionMediaType>('INFOGRAPHIC');
  const [mediaUrl, setMediaUrl] = React.useState('');
  const [referenceUrl, setReferenceUrl] = React.useState('');
  const [thumbnailUrl, setThumbnailUrl] = React.useState('');
  const [targetRiskLevels, setTargetRiskLevels] = React.useState<
    TargetRiskLevel[]
  >(['MILD_STRESS', 'MODERATE_RISK']);
  const [priority, setPriority] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    if (resource) {
      setTitle(resource.title || '');
      setDescription(resource.description || '');
      setSourceOrganization(resource.sourceOrganization || '');
      setMediaType(resource.mediaType || 'INFOGRAPHIC');
      setMediaUrl(resource.mediaUrl || '');
      setReferenceUrl(resource.referenceUrl || '');
      setThumbnailUrl(resource.thumbnailUrl || '');
      setTargetRiskLevels(
        resource.targetRiskLevels?.length
          ? resource.targetRiskLevels
          : ['MILD_STRESS', 'MODERATE_RISK'],
      );
      setPriority(resource.priority ?? 0);
      setIsActive(resource.isActive ?? true);
    } else {
      setTitle('');
      setDescription('');
      setSourceOrganization('');
      setMediaType('INFOGRAPHIC');
      setMediaUrl('');
      setReferenceUrl('');
      setThumbnailUrl('');
      setTargetRiskLevels(['MILD_STRESS', 'MODERATE_RISK']);
      setPriority(0);
      setIsActive(true);
    }
  }, [resource, open]);

  const handleToggleRiskLevel = (level: TargetRiskLevel) => {
    setTargetRiskLevels((prev) => {
      if (prev.includes(level)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((item) => item !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !mediaUrl.trim()) return;

    const dto: CreateInterventionResourceDTO = {
      title: title.trim(),
      description: description.trim(),
      sourceOrganization: sourceOrganization.trim() || undefined,
      mediaType,
      mediaUrl: mediaUrl.trim(),
      referenceUrl: referenceUrl.trim() || undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      targetRiskLevels,
      priority: Number(priority) || 0,
      isActive,
    };

    await onSubmit(dto);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl p-0">
        <div className="border-b border-slate-100 bg-linear-to-r from-sky-50 via-slate-50 to-white px-6 py-5">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-2 text-sky-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Cập nhật Bài Tập / Tài Liệu' : 'Đăng Bài Tập / Tài Liệu Hỗ Trợ'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Tài nguyên thẩm định y khoa & bài tập điều hòa cảm xúc (Infographic, PDF, Clip, Audio) gửi tới người dùng.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4 text-sm">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Tiêu đề Bài tập / Tài liệu <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kỹ thuật hít thở 4-7-8 xoa dịu căng thẳng tức thì"
              required
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Tổ chức / Nguồn y tế phát hành
              </Label>
              <Input
                value={sourceOrganization}
                onChange={(e) => setSourceOrganization(e.target.value)}
                placeholder="Ví dụ: Bộ Y Tế, Viện Sức Khỏe Tâm Thần, WHO..."
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Định dạng Media <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={mediaType}
                onValueChange={(val) => setMediaType(val as InterventionMediaType)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 text-xs font-medium">
                  <SelectValue placeholder="Chọn định dạng" />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-3.5 w-3.5 text-sky-600" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Đường dẫn File Media (Media URL) <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://cdn.domain.com/documents/hit-tho-4-7-8.pdf"
                required
                className="rounded-xl border-slate-200 pl-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Link bài viết gốc / tham chiếu y khoa (Reference URL)
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://moh.gov.vn/..."
                  className="rounded-xl border-slate-200 pl-9 font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Ảnh bìa Thumbnail (Tùy chọn)
              </Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://cdn.domain.com/thumb.jpg"
                  className="rounded-xl border-slate-200 pl-9 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Mô tả tóm tắt nội dung <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hướng dẫn chi tiết từng bước thực hành kỹ thuật thở giúp hạ nhịp tim và cân bằng hệ thần kinh thực vật..."
              required
              rows={3}
              className="resize-none rounded-xl border-slate-200"
            />
          </div>

          {/* TARGET RISK LEVELS CHECKBOXES */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <Label className="text-xs font-semibold text-slate-800">
              Cấp độ rủi ro cảm xúc áp dụng <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-1">
              {RISK_LEVELS.map((risk) => {
                const checked = targetRiskLevels.includes(risk.value);
                return (
                  <div
                    key={risk.value}
                    onClick={() => handleToggleRiskLevel(risk.value)}
                    className={`flex items-start gap-2.5 rounded-xl border p-2.5 transition cursor-pointer select-none ${
                      checked
                        ? 'border-sky-300 bg-white shadow-xs'
                        : 'border-slate-200 bg-white/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => handleToggleRiskLevel(risk.value)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-900">
                        {risk.label.split(' (')[0]}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {risk.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-slate-700">
                Độ ưu tiên hiển thị (Priority):
              </Label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) || 0)}
                className="h-8 w-20 rounded-lg border-slate-200 bg-white text-xs font-mono text-center"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="resource-active-toggle"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label
                htmlFor="resource-active-toggle"
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
              disabled={
                loading ||
                !title.trim() ||
                !description.trim() ||
                !mediaUrl.trim() ||
                !targetRiskLevels.length
              }
              className="rounded-xl bg-sky-600 text-white shadow-sm hover:bg-sky-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Lưu Thay Đổi' : 'Đăng Tài Liệu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
