import { Download, Save, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
          <ShieldCheck className="h-4 w-4" />
          Cấu hình hệ thống
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Thiết lập & an toàn</h1>
          <p className="text-sm text-slate-500">
            Điều chỉnh chính sách nền tảng, tự động hóa và cảnh báo cho toàn bộ hệ thống
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Button variant="outline" className="border-sky-200 text-slate-700 hover:bg-sky-50">
          <Download className="mr-2 h-4 w-4" />
          Xuất cấu hình
        </Button>
        <Button className="bg-sky-600 text-white shadow-sm hover:bg-sky-700">
          <Save className="mr-2 h-4 w-4" />
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}
