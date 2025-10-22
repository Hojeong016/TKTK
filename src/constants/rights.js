export const RIGHTS = {
  MASTER: { key: 'master', label: 'MASTER' },
  STREAMER: { key: 'streamer', label: 'STREAMER' },
  TIER3: { key: '3tier', label: '3티어' },
};

export const getRightLabel = (rightValue) => {
  if (!rightValue) return null;
  const key = String(rightValue).trim().toLowerCase();
  const found = Object.values(RIGHTS).find((r) => r.key === key);
  return found ? found.label : rightValue;
};
