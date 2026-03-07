'use client';

import * as React from 'react';
import { Archive, CloudDownload, Database, History, ServerCog } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function DataGovernanceCard() {
  const [retention, setRetention] = React.useState('90d');
  const [backupWindow, setBackupWindow] = React.useState('02:00 UTC');
  const [autoClean, setAutoClean] = React.useState(true);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Dữ liệu & sao lưu</p>
          <p className="text-xs text-slate-500">Chính sách lưu trữ, lịch backup và tệp export</p>
        </div>
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
          <Database className="mr-1 h-4 w-4" />
          Cluster chính
        </Badge>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-3 rounded-xl border border-sky-50 bg-sky-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <History className="h-4 w-4 text-sky-500" />
            Lưu trữ
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Thời gian giữ log</Label>
            <Select value={retention} onValueChange={setRetention}>
              <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">30 ngày</SelectItem>
                <SelectItem value="90d">90 ngày</SelectItem>
                <SelectItem value="180d">180 ngày</SelectItem>
                <SelectItem value="365d">365 ngày</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-3">
              <Switch
                id="autoClean"
                checked={autoClean}
                onCheckedChange={setAutoClean}
                className="data-[state=checked]:bg-slate-800"
              />
              <Label htmlFor="autoClean" className="text-sm font-medium text-slate-800">
                Xóa tự động bản cũ
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ServerCog className="h-4 w-4 text-emerald-500" />
            Lịch backup
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Khung giờ backup</Label>
            <Select value={backupWindow} onValueChange={setBackupWindow}>
              <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                <SelectValue placeholder="Chọn khung giờ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="02:00 UTC">02:00 UTC</SelectItem>
                <SelectItem value="08:00 UTC">08:00 UTC</SelectItem>
                <SelectItem value="14:00 UTC">14:00 UTC</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Sao lưu full hàng ngày, incremental mỗi 2 giờ</p>
            <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
              <CloudDownload className="mr-2 h-4 w-4" />
              Lấy bản backup mới nhất
            </Button>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Archive className="h-4 w-4 text-amber-500" />
            Export
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p>• Nhật ký truy cập 30 ngày gần nhất</p>
            <p>• Danh sách nhóm và trạng thái phê duyệt</p>
            <p>• Báo cáo vi phạm và quyết định xử lý</p>
            <Button variant="outline" className="w-fit border-slate-200 text-slate-700 hover:bg-slate-50">
              Tải xuống CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
