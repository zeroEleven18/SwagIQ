/**
 * Utility for parsing, validating and embedding YouTube video URLs and IDs
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // If already a clean 11-character YouTube video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Handle all standard YouTube URL schemes
  // youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/embed/xxx, youtube.com/live/xxx, youtube.com/shorts/xxx, m.youtube.com/...
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = cleanUrl.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: match any 11-character token if string contains youtube or youtu
  if (cleanUrl.toLowerCase().includes('youtu')) {
    const fallbackMatch = cleanUrl.match(/([a-zA-Z0-9_-]{11})/);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }
  }

  return null;
}

export function extractYouTubeStartTime(url: string): number {
  if (!url) return 0;
  const timeMatch = url.match(/[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?|(\d+))/);
  if (!timeMatch) return 0;
  
  if (timeMatch[4]) return parseInt(timeMatch[4], 10);
  const hours = parseInt(timeMatch[1] || '0', 10);
  const minutes = parseInt(timeMatch[2] || '0', 10);
  const seconds = parseInt(timeMatch[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay: boolean = false, startSec: number = 0): string {
  const startParam = startSec > 0 ? `&start=${Math.floor(startSec)}` : '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=0&controls=1&enablejsapi=1&playsinline=1&rel=0&iv_load_policy=3&modestbranding=1${startParam}`;
}

/**
 * Ensures the YouTube Iframe API is loaded on the page
 */
export function ensureYouTubeIframeApi(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    
    if ((window as any).YT && (window as any).YT.Player) {
      return resolve((window as any).YT);
    }

    // Check if script tag is already being loaded
    const existingScript = document.getElementById('youtube-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Set callback
    const prevOnReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') {
        prevOnReady();
      }
      resolve((window as any).YT);
    };

    // Timeout fallback after 3 seconds in case script is slow or blocked
    setTimeout(() => {
      if ((window as any).YT) {
        resolve((window as any).YT);
      } else {
        resolve(null);
      }
    }, 3000);
  });
}

