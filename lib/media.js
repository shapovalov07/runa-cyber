const VIDEO_MEDIA_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v', '.ogv', '.ogg', '.avi', '.mkv'];

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export function isVideoMediaSrc(src) {
  const value = getText(src).toLowerCase();
  if (!value) return false;
  if (value.startsWith('data:video/')) return true;

  const normalized = value.split('#')[0].split('?')[0];
  return VIDEO_MEDIA_EXTENSIONS.some((ext) => normalized.endsWith(ext));
}
