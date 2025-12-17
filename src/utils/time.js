const clampToNumber = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) {
    return 0;
  }
  return numeric;
};

export const formatSecondsToClock = (seconds) => {
  const totalSeconds = Math.floor(clampToNumber(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (value) => value.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
};

export const formatSecondsToDurationLabel = (seconds) => {
  const totalSeconds = Math.floor(clampToNumber(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}초`);

  return parts.join(' ');
};

export const formatTimestamp = (date) => {
  if (!date) return '';

  const target = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(target.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(target);
};
