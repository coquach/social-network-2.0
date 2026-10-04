'use client';

import React from 'react';
import { useCrisisStore } from '@repo/shared';
import { X, Phone, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Keep in sync with CRISIS_RESOURCES in ai-chatbot-service (prompt_builder.py).
const DEFAULT_RESOURCES = [
  { name: 'Đường dây nóng Ngày Mai', phone: '1900 599 830' },
  { name: 'Tổng đài Quốc gia', phone: '111' },
];

export function CrisisBanner() {
  const { activeCrisis, dismissCrisis } = useCrisisStore();

  if (!activeCrisis) {
    return null;
  }

  const resources = activeCrisis.resources && activeCrisis.resources.length > 0
    ? activeCrisis.resources
    : DEFAULT_RESOURCES;

  const isHighSeverity = activeCrisis.severity === 'high';

  if (!isHighSeverity) {
    return (
      <div className="fixed top-20 right-4 z-[9999] max-w-sm bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-start gap-3 border border-red-400">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-white" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {activeCrisis.notificationSent
              ? 'Hệ thống nhận thấy bạn đang có dấu hiệu căng thẳng. Vui lòng kiểm tra mục thông báo để xem hỗ trợ.'
              : 'Hệ thống nhận thấy bạn đang có dấu hiệu căng thẳng. Nếu cần hỗ trợ, hãy liên hệ Tổng đài Quốc gia 111.'}
          </p>
        </div>
        <button onClick={dismissCrisis} className="shrink-0 p-1 hover:bg-red-600 rounded-md transition-colors">
          <X className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  // Always show crisis dialog overriding user preferences
  return (
    <Dialog open={!!activeCrisis} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md bg-white p-0 border-rose-600 border-2 overflow-hidden shadow-2xl z-[9999]"
        showCloseButton={false} // Hide default close button to force user to acknowledge
      >
        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="text-lg font-bold text-white">Cảnh báo khẩn cấp</DialogTitle>
          </div>
          <button 
            onClick={dismissCrisis}
            className="rounded-full p-1 hover:bg-rose-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-800 font-medium mb-4 text-center">
            Hệ thống nhận thấy bạn đang trải qua khủng hoảng tâm lý nghiêm trọng. 
            An toàn của bạn là ưu tiên hàng đầu. Xin hãy liên hệ ngay với những nguồn hỗ trợ dưới đây:
          </p>
          
          <div className="space-y-3">
            {resources.map((resource: any, idx: number) => (
              <a 
                key={idx}
                href={`tel:${resource.phone}`}
                className="flex items-center gap-3 bg-rose-50 p-3 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <div className="bg-rose-500 rounded-full p-2 text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-700">{resource.name}</h4>
                  <p className="text-rose-600 font-medium">{resource.phone}</p>
                </div>
              </a>
            ))}
            
          </div>
          
          <button
            onClick={dismissCrisis}
            className="w-full mt-6 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đã hiểu, đóng thông báo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
