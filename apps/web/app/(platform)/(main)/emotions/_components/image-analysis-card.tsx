import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageEmotionDTO } from '@/models/emotion/emotionDTO';
import { getEmotionMeta } from './emotion-meta';
import { EmotionScoreBlock } from './emotion-score-block';

export const ImageAnalysisCard = ({ images }: { images: ImageEmotionDTO[] }) => {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-sky-500">
          Phân tích hình ảnh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {images.length === 0 ? (
          <p className="text-sm text-slate-500">
            Không có hình ảnh nào được phân tích cho nội dung này.
          </p>
        ) : (
          images.map((img, idx) => {
            const meta = getEmotionMeta(img.dominantEmotion);
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-3"
              >
                {img.url ? (
                  <div className="relative h-56 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <Image
                      src={img.url}
                      alt={`Ảnh ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 600px"
                      loading="lazy"
                      className="object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.classList.add('hidden');
                      }}
                      priority={false}
                    />
                  </div>
                ) : (
                  <div className="h-56 w-full rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center text-sm text-slate-500">
                    Hình ảnh không tồn tại.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-700"
                  >
                    Ảnh {idx + 1}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  >
                    {img.faceCount} khuôn mặt
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-slate-200 bg-white text-slate-700"
                  >
                    {meta.label}
                  </Badge>
                </div>
                {img.error ? (
                  <p className="mt-2 text-sm text-rose-600">
                    Lỗi: {img.error}
                  </p>
                ) : (
                  <div className="mt-3">
                    <EmotionScoreBlock scores={img.emotionScores} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
