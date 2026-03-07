'use client';

import * as React from 'react';
import { BadgeCheck, LockKeyhole, ShieldAlert, ShieldHalf, Timer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

export function SecurityControlsCard() {
  const [enforce2FA, setEnforce2FA] = React.useState(true);
  const [sso, setSso] = React.useState(false);
  const [lockdown, setLockdown] = React.useState(false);
  const [session, setSession] = React.useState('30m');

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Bảo mật & truy cập</p>
          <p className="text-xs text-slate-500">Chính sách đăng nhập, giới hạn phiên và tình trạng khóa hệ thống</p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <BadgeCheck className="mr-1 h-4 w-4" />
          Bảo mật cao
        </Badge>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-sky-50 bg-sky-50/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <ShieldHalf className="h-4 w-4 text-sky-500" />
            Chính sách đăng nhập
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="enforce2FA"
                checked={enforce2FA}
                onCheckedChange={setEnforce2FA}
                className="data-[state=checked]:bg-sky-600"
              />
              <div>
                <Label htmlFor="enforce2FA" className="text-sm font-medium text-slate-800">
                  Bắt buộc 2FA cho admin
                </Label>
                <p className="text-xs text-slate-500">Áp dụng OTP/Authenticator khi đăng nhập vào bảng điều khiển</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="ssoOnly"
                checked={sso}
                onCheckedChange={setSso}
                className="data-[state=checked]:bg-slate-900"
              />
              <div>
                <Label htmlFor="ssoOnly" className="text-sm font-medium text-slate-800">
                  Ưu tiên SSO nội bộ
                </Label>
                <p className="text-xs text-slate-500">Chỉ cho phép đăng nhập qua SSO doanh nghiệp đối với nhân sự</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <LockKeyhole className="h-4 w-4 text-red-500" />
            Phiên & khóa hệ thống
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-slate-600">Tự động đăng xuất sau</Label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger className="mt-1 border-sky-100 focus:ring-sky-200">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 phút</SelectItem>
                  <SelectItem value="30m">30 phút</SelectItem>
                  <SelectItem value="1h">1 giờ</SelectItem>
                  <SelectItem value="4h">4 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-600" htmlFor="ipList">
                IP cho phép (comma-separated)
              </Label>
              <Input
                id="ipList"
                placeholder="203.0.113.1, 203.0.113.12"
                className="mt-1 border-slate-200 focus-visible:ring-sky-200"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/60 p-3">
              <Switch
                id="lockdown"
                checked={lockdown}
                onCheckedChange={setLockdown}
                className="data-[state=checked]:bg-red-500"
              />
              <div>
                <Label htmlFor="lockdown" className="text-sm font-semibold text-red-700">
                  Kích hoạt chế độ phong tỏa
                </Label>
                <p className="text-xs text-red-600">
                  Từ chối đăng nhập mới, chỉ cho phép tài khoản siêu quản trị khi bật
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <Timer className="h-4 w-4 text-slate-500" />
                Version policy
              </span>
              <span>Đã bật cảnh báo nâng cấp 3 bản gần nhất</span>
            </div>

            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Kiểm tra cấu hình bảo mật
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
