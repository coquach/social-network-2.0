import { reactionsUI } from '@/lib/types/reaction';
import { ReactionType } from '@/models/social/enums/social.enum';

interface ReactionCount {
  type: ReactionType;
  count: number;
}

export function getTopReactions(counts: ReactionCount[], top = 3) {
  const filtered = counts.filter((r) => r.count > 0);
  const sorted = filtered.sort((a, b) => b.count - a.count);
  const topReacts = sorted
    .slice(0, top)
    .map((r) => reactionsUI.find((x) => x.type === r.type))
    .filter(Boolean);
  const total = filtered.reduce((sum, r) => sum + r.count, 0);
  return { topReacts, total };
}
