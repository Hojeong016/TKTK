export const TIERS = {
  BRONZE: { key: 'bronze', label: 'Bronze' },
  SILVER: { key: 'silver', label: 'Silver' },
  GOLD: { key: 'gold', label: 'Gold' },
  PLATINUM: { key: 'platinum', label: 'Platinum' },
  DIAMOND: { key: 'diamond', label: 'Diamond' },
  CROWN: { key: 'crown', label: 'Crown' },
  ACE: { key: 'ace', label: 'Ace' },
  MASTER: { key: 'master', label: 'Master' },
  CHALLENGER: { key: 'challenger', label: 'Challenger' },
  CONQUEROR: { key: 'conqueror', label: 'Conqueror' },
  UNRANKED: { key: 'unranked', label: 'Unranked' },
};

export function getTierIcon(tierValue, props = {}) {
  if (!tierValue) return null;
  const key = String(tierValue).trim().toLowerCase().replace(/\s+/g, '');
  const filename = `${key}.png`;
  const src = `/assets/tiers/${filename}`;
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <img src={src} alt={`Tier ${tierValue}`} {...props} />;
}