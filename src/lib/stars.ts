export const renderStars = (n: number) => {
  const clamped = Math.max(0, Math.min(5, n || 0));
  return '★'.repeat(clamped) + '☆'.repeat(5 - clamped);
};
