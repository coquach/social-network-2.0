'use client';

import * as React from 'react';
import { Globe2, Languages, Sparkles } from 'lucide-react';

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

export function GeneralPreferencesCard() {
  const [language, setLanguage] = React.useState('vi');
  const [timezone, setTimezone] = React.useState('asia');
  const [freshness, setFreshness] = React.useState('2h');
  const [maintenance, setMaintenance] = React.useState(false);

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Cài đặt chung</p>
          <p className="text-xs text-slate-500">Bản địa hóa, nhận diện và trạng thái hoạt động của nền tảng</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-sky-700">
          <Sparkles className="h-4 w-4" />
          Đồng bộ tự động
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-sky-50 bg-sky-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Globe2 className="h-4 w-4 text-sky-500" />
            Nhận diện thương hiệu
          </div>
          <div className="grid gap-3">
            <Label className="text-xs text-slate-600" htmlFor="platformName">
              Tên nền tảng
            </Label>
            <Input
              id="platformName"
              placeholder="Social 360"
              className="border-sky-100 focus-visible:ring-sky-200"
            />
            <Label className="text-xs text-slate-600" htmlFor="supportEmail">
              Email hỗ trợ
            </Label>
            <Input
              id="supportEmail"
              type="email"
              placeholder="ops@social360.vn"
              className="border-sky-100 focus-visible:ring-sky-200"
            />
            <div className="flex items-center gap-3">
              <Switch
                id="maintenanceMode"
                checked={maintenance}
                onCheckedChange={setMaintenance}
                className="data-[state=checked]:bg-sky-600"
              />
              <div>
                <Label htmlFor="maintenanceMode" className="text-sm font-medium text-slate-800">
                  Chế độ bảo trì
                </Label>
                <p className="text-xs text-slate-500">
                  Tạm dừng đăng mới, chỉ cho phép admin truy cập khi bật
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Languages className="h-4 w-4 text-amber-500" />
            Ngôn ngữ & thời gian
          </div>
          <div className="grid gap-3">
            <div>
              <Label className="text-xs text-slate-600">Ngôn ngữ mặc định</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="jp">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Múi giờ</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                  <SelectValue placeholder="Chọn múi giờ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asia">Asia/Ho_Chi_Minh</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="pacific">US/Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Độ mới dữ liệu feed</Label>
              <Select value={freshness} onValueChange={setFreshness}>
                <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30m">30 phút</SelectItem>
                  <SelectItem value="2h">2 giờ</SelectItem>
                  <SelectItem value="6h">6 giờ</SelectItem>
                  <SelectItem value="24h">24 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="mt-1 w-fit bg-slate-800 text-white hover:bg-slate-900">
              Cập nhật bản địa hóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
