const FALLBACK_PREVIEW = "Discover practical insights and highlights in this concise blog update for readers.";

const stripHtml = (value: string) => {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
};

const decodeHtmlEntities = (value: string) => {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
};

export const buildBlogPreview = (content: string | null | undefined, maxLength = 130) => {
  if (!content) {
    return FALLBACK_PREVIEW;
  }

  const normalized = decodeHtmlEntities(stripHtml(content)).replace(/\s+/g, " ").trim();
  if (!normalized) {
    return FALLBACK_PREVIEW;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};
