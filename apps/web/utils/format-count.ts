export  const formatCount = (num: number) => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}T`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}Tr`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
};