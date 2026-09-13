export type NewsHeadline = {
  title: string;
  link: string;
  publishedAt?: string;
  source: string;
  description?: string;
};

const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC News" },
  { url: "https://apnews.com/index.rss", source: "AP News" },
];

function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
}

function tag(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, " ")) : undefined;
}

export async function fetchNewsHeadlines(limit = 8): Promise<NewsHeadline[]> {
  const batches = await Promise.all(FEEDS.map(async (feed) => {
    try {
      const response = await fetch(feed.url, { headers: { "user-agent": "SahabatAI/1.1 news reader" }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) return [];
      const xml = await response.text();
      return Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/gi)).map((match) => match[0]).map((item) => ({
        title: tag(item, "title") ?? "Tanpa judul",
        link: tag(item, "link") ?? "",
        publishedAt: tag(item, "pubDate"),
        description: tag(item, "description"),
        source: feed.source,
      })).filter((item) => item.title && item.link);
    } catch {
      return [];
    }
  }));
  return batches.flat().slice(0, limit);
}
