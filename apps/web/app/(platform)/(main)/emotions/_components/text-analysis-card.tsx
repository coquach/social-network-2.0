import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TextEmotionDTO } from '@/models/emotion/emotionDTO';
import { getEmotionMeta } from './emotion-meta';
import { EmotionScoreBlock } from './emotion-score-block';

export const TextAnalysisCard = ({ textEmotion }: { textEmotion: TextEmotionDTO | null }) => {
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-sky-500">
          Phân tích văn bản
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {textEmotion ? (
          <>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700"
              >
                {getEmotionMeta(textEmotion.dominantEmotion).label}
              </Badge>
              <span className="text-sm text-slate-600">Cảm xúc chính</span>
            </div>
            <EmotionScoreBlock scores={textEmotion.emotionScores} />
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Không có dữ liệu văn bản cho mục này.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
