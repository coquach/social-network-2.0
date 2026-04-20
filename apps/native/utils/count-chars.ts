export function countChars(text: string): number {
  const normalized = (text ?? '').normalize('NFC');
  const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;

  if (!hasSegmenter) {
    return normalized.length;
  }

  const SegmenterCtor = (Intl as { Segmenter: typeof Intl.Segmenter })
    .Segmenter;
  const segmenter = new SegmenterCtor('vi', { granularity: 'grapheme' });
  return Array.from(segmenter.segment(normalized)).filter(Boolean).length;
}
