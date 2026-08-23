export interface TwitchParsedTarget {
  type: 'channel' | 'video' | 'clip';
  id: string;
  originalUrl: string;
}

/**
 * Extracts and classifies a Twitch URL into Channel (Live), Video (VOD/Archived), or Clip.
 */
export function extractTwitchInfo(url: string): TwitchParsedTarget | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();

  // Pattern 1: Clips on clips.twitch.tv/ClipID
  const clipsTvRegex = /(?:https?:\/\/)?clips\.twitch\.tv\/([A-Za-z0-9_-]+)/i;
  const clipsTvMatch = cleanUrl.match(clipsTvRegex);
  if (clipsTvMatch && clipsTvMatch[1]) {
    return {
      type: 'clip',
      id: clipsTvMatch[1],
      originalUrl: cleanUrl
    };
  }

  // Pattern 2: Clips on twitch.tv/channel/clip/ClipID
  const channelClipRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/[^/]+\/clip\/([A-Za-z0-9_-]+)/i;
  const channelClipMatch = cleanUrl.match(channelClipRegex);
  if (channelClipMatch && channelClipMatch[1]) {
    return {
      type: 'clip',
      id: channelClipMatch[1],
      originalUrl: cleanUrl
    };
  }

  // Pattern 3: VODs / Archived videos: twitch.tv/videos/123456789
  const videoRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/videos\/([0-9]+)/i;
  const videoMatch = cleanUrl.match(videoRegex);
  if (videoMatch && videoMatch[1]) {
    return {
      type: 'video',
      id: videoMatch[1],
      originalUrl: cleanUrl
    };
  }

  // Pattern 4: Channel / Live Stream: twitch.tv/channel_name
  const channelRegex = /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([A-Za-z0-9_]{3,25})(?:\/|$|\?)/i;
  const channelMatch = cleanUrl.match(channelRegex);
  if (channelMatch && channelMatch[1]) {
    const reservedWords = ['directory', 'p', 'downloads', 'jobs', 'turbo', 'settings', 'search'];
    if (!reservedWords.includes(channelMatch[1].toLowerCase())) {
      return {
        type: 'channel',
        id: channelMatch[1],
        originalUrl: cleanUrl
      };
    }
  }

  return null;
}

/**
 * Returns parent domain for Twitch iframe embed, respecting current window host or localhost fallback.
 */
export function getTwitchParentDomain(): string {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    return host && host.length > 0 ? host : 'localhost';
  }
  return 'localhost';
}

/**
 * Builds the responsive iframe URL for Twitch.
 */
export function getTwitchEmbedUrl(
  parsed: TwitchParsedTarget,
  autoplay: boolean = true,
  muted: boolean = true
): string {
  const parent = getTwitchParentDomain();
  const auto = autoplay ? 'true' : 'false';
  const mute = muted ? 'true' : 'false';

  if (parsed.type === 'clip') {
    return `https://clips.twitch.tv/embed?clip=${parsed.id}&parent=${parent}&autoplay=${auto}&muted=${mute}`;
  }

  if (parsed.type === 'video') {
    return `https://player.twitch.tv/?video=v${parsed.id}&parent=${parent}&autoplay=${auto}&muted=${mute}`;
  }

  // Channel (Live Stream)
  return `https://player.twitch.tv/?channel=${parsed.id}&parent=${parent}&autoplay=${auto}&muted=${mute}`;
}

/**
 * Provides a fallback or placeholder thumbnail for Twitch stream/video previews.
 */
export function getTwitchPlaceholderThumbnail(type: 'channel' | 'video' | 'clip', id: string): string {
  return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80';
}
