export const truncateText = (value: string | null | undefined, maxLength: number) => {
  if (maxLength <= 0) {
    return '';
  }

  const normalized = (value ?? '').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const ellipsis = '...';
  if (maxLength <= ellipsis.length) {
    return ellipsis;
  }

  const sliceLength = Math.max(0, maxLength - ellipsis.length);
  return `${normalized.slice(0, sliceLength).trimEnd()}${ellipsis}`;
};
