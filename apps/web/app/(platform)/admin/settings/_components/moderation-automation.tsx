'use client';

import * as React from 'react';
import { AlertTriangle, Gauge, ListChecks, Workflow } from 'lucide-react';

import { Button } from '@/components/ui/button';
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

const playbooks = [
  {
    title: 'Hạ cấp bài viết',
    detail: 'Ẩn bài, gửi cảnh báo tới tác giả khi có >= 5 báo cáo nghiêm trọng',
  },
  {
    title: 'Escalate to Ops',
    detail: 'Tự động chuyển báo cáo độ ưu tiên cao sang hàng đợi Ops',
  },
  {
    title: 'Khóa bình luận',
    detail: 'Khóa bình luận khi nội dung bị cắm cờ spam trong 24h gần nhất',
  },
];

export function ModerationAutomationCard() {
  const [autoLock, setAutoLock] = React.useState(true);
  const [priority, setPriority] = React.useState('p1');
  const [threshold, setThreshold] = React.useState('8');

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Tự động hóa kiểm duyệt</p>
          <p className="text-xs text-slate-500">Ngưỡng cảnh báo, ưu tiên xử lý và playbook thực thi tự động</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <Workflow className="h-4 w-4" />
          3 playbook đang hoạt động
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-3 rounded-xl border border-sky-50 bg-sky-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Gauge className="h-4 w-4 text-sky-500" />
            Ngưỡng cảnh báo
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-600" htmlFor="threshold">
              Số báo cáo nghiêm trọng
            </Label>
            <Input
              id="threshold"
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="border-sky-100 focus-visible:ring-sky-200"
            />
            <p className="text-xs text-slate-500">Khóa bài khi chạm ngưỡng này trong 6 giờ gần nhất</p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Mức độ ưu tiên
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Ưu tiên gán cho báo cáo</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                <SelectValue placeholder="Chọn mức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p1">P1 - Tự động khóa</SelectItem>
                <SelectItem value="p2">P2 - Gửi lên queue moderation</SelectItem>
                <SelectItem value="p3">P3 - Chờ soát thủ công</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3">
              <Switch
                id="autoLock"
                checked={autoLock}
                onCheckedChange={setAutoLock}
                className="data-[state=checked]:bg-amber-500"
              />
              <div>
                <Label htmlFor="autoLock" className="text-sm font-medium text-slate-800">
                  Auto-lock bài viết vi phạm
                </Label>
                <p className="text-xs text-amber-700">Tự khóa trong 24h, mở lại nếu kiểm duyệt viên gỡ cờ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ListChecks className="h-4 w-4 text-emerald-500" />
            Playbook
          </div>
          <div className="space-y-3">
            {playbooks.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            ))}
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Thêm playbook mới
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
