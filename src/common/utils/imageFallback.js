const FAILED_IMAGE_URLS = new Set();

export const isDiscordImageUrl = value => {
  if (typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  try {
    const url = new URL(trimmed);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname.toLowerCase();
    return (
      hostname.includes('discord') ||
      hostname.includes('discordapp') ||
      hostname.includes('discordapp.net') ||
      hostname.includes('discordapp.com')
    );
  } catch {
    return false;
  }
};

export const normalizeImageSource = value => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (!trimmed || isDiscordImageUrl(trimmed)) {
    return '';
  }

  try {
    const url = new URL(trimmed);

    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

export const resetFailedImages = () => {
  FAILED_IMAGE_URLS.clear();
};

export const clearFailedImage = value => {
  const normalized = normalizeImageSource(value);

  if (!normalized) {
    return '';
  }

  FAILED_IMAGE_URLS.delete(normalized);
  return normalized;
};

export const markFailedImage = value => {
  const normalized = normalizeImageSource(value);

  if (!normalized) {
    return '';
  }

  FAILED_IMAGE_URLS.add(normalized);
  return normalized;
};

export const hasFailedImage = value => {
  const normalized = normalizeImageSource(value);

  return Boolean(normalized && FAILED_IMAGE_URLS.has(normalized));
};
