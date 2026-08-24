const BLOCKED = /\b(bhakti|bhajan|devotional|devotion|aarti|arti|chhath|shiv|shiva|mahadev|bholenath|ram|hanuman|durga|devi|mata|krishna|radha|navratri|sawan|kanwar|kawariya|islamic|naat|allah)\b|भक्ति|भजन|आरती|छठ|महादेव|भोलेनाथ|शिव|राम|हनुमान|दुर्गा|देवी|माता|कृष्ण|राधा|नवरात्रि|सावन|कांवड़|कावड़|नात|इस्लामिक/i;

module.exports = async (request, response) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return response.status(503).json({ error: 'YouTube API is not configured' });
  const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({ part: 'snippet', type: 'video', q: 'Bhojpuri new song -bhajan -bhakti -devotional -chhath -aarti', order: 'viewCount', publishedAfter, regionCode: 'IN', videoEmbeddable: 'true', videoSyndicated: 'true', maxResults: '30', key });
  try {
    const upstream = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!upstream.ok) throw new Error(`YouTube returned ${upstream.status}`);
    const payload = await upstream.json();
    const items = payload.items.filter(item => !BLOCKED.test(`${item.snippet.title} ${item.snippet.channelTitle} ${item.snippet.description || ''}`)).slice(0, 12);
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return response.status(200).json({ items });
  } catch (error) {
    return response.status(502).json({ error: 'Unable to load fresh Bhojpuri music' });
  }
};
