export function parseLink(url) {
  const normalized = url.trim();
  const result = {
    type: 'unknown',
    thumbnail: null,
    title: null,
    embedUrl: null,
    iframeAllowed: false,
    originalUrl: normalized,
  };

  const youtubeMatch = normalized.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    result.type = 'youtube';
    result.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    result.embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    result.iframeAllowed = true;
    return result;
  }

  const instagramMatch = normalized.match(/instagram\.com\/(reel|p)\/([^/?#&]+)/);
  if (instagramMatch) {
    const kind = instagramMatch[1];
    const mediaId = instagramMatch[2];
    result.type = 'instagram';
    result.embedUrl = `https://www.instagram.com/${kind}/${mediaId}/embed`;
    result.iframeAllowed = false;  // Instagram blocks iframes, show fallback
    return result;
  }

  if (/facebook\.com\/.+/.test(normalized)) {
    result.type = 'facebook';
    result.embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(normalized)}&show_text=0&width=560`;
    result.iframeAllowed = false;  // Facebook blocks iframes, show fallback
    return result;
  }

  if (/linkedin\.com\/.+/.test(normalized)) {
    result.type = 'linkedin';
    return result;
  }
  if (/reddit\.com\/.+/.test(normalized)) {
    result.type = 'reddit';
    return result;
  }
  if (/drive\.google\.com\/.+/.test(normalized)) {
    result.type = 'googledrive';
    return result;
  }

  return result;
}
