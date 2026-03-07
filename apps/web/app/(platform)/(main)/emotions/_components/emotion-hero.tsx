import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface EmotionHeroProps {
  onAddMood?: () => void;
}

export const EmotionHero = ({ onAddMood }: EmotionHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-linear-to-r from-sky-50 via-white to-emerald-50 p-6 shadow-sm">
      <div className="absolute inset-y-0 right-0 h-full w-1/3 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_60%)]" />
      <div className="absolute -left-20 top-10 h-40 w-40 rounded-full bg-sky-100 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 ">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-sky-200 bg-white text-sky-500">
              <Sparkles className="mr-1 h-4 w-4" />
              Theo dõi cảm xúc
            </Badge>
            <span className="text-xs uppercase tracking-wide text-slate-500">
              Trạng thái cá nhân
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-sky-600">
              Nhật ký cảm xúc
            </h1>
            <p className="text-sm text-slate-600">
              Nắm bắt cảm xúc mỗi ngày, xem xu hướng và những khoảnh khắc đáng chú ý
              để hiểu hơn về hành trình của bạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className=" text-white shadow-sm" onClick={onAddMood}>
              Ghi lại cảm xúc
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 text-slate-700 hover:border-slate-300"
              asChild
            >
              <a href="#emotion-history">Xem nhật ký gần đây</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
