const BLOCKED = /\b(bhakti|bhajan|devotional|devotion|aarti|arti|chhath|shiv|shiva|mahadev|bholenath|ram|hanuman|durga|devi|mata|krishna|radha|navratri|sawan|kanwar|kawariya|islamic|naat|allah)\b|भक्ति|भजन|आरती|छठ|महादेव|भोलेनाथ|शिव|राम|हनुमान|दुर्गा|देवी|माता|कृष्ण|राधा|नवरात्रि|सावन|कांवड़|कावड़|नात|इस्लामिक/i;
const FEATURED_PLAYLIST_ID = 'PLwyqDgjhF4Qpq6kslMcQ8NR6RHb-Z4Tu-';

function eligible(item) {
  const snippet = item.snippet || {};
  return (item.id?.videoId || snippet.resourceId?.videoId) && !BLOCKED.test(`${snippet.title} ${snippet.channelTitle} ${snippet.description || ''}`);
}

async function fetchYouTube(url) {
  const upstream = await fetch(url);
  if (!upstream.ok) throw new Error(`YouTube returned ${upstream.status}`);
  return upstream.json();
}

module.exports = async (request, response) => {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return response.status(503).json({ error: 'YouTube API is not configured' });
  const publishedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const freshParams = new URLSearchParams({ part: 'snippet', type: 'video', q: 'Bhojpuri new song -bhajan -bhakti -devotional -chhath -aarti', order: 'viewCount', publishedAfter, regionCode: 'IN', videoEmbeddable: 'true', videoSyndicated: 'true', maxResults: '30', key });
  const playlistParams = new URLSearchParams({ part: 'snippet', playlistId: FEATURED_PLAYLIST_ID, maxResults: '50', key });
  try {
    const [playlistPayload, freshPayload] = await Promise.all([
      fetchYouTube(`https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams}`),
      fetchYouTube(`https://www.googleapis.com/youtube/v3/search?${freshParams}`)
    ]);
    const playlistItems = playlistPayload.items.filter(eligible).slice(0, 12).map(item => ({ ...item, id: { videoId: item.snippet.resourceId.videoId } }));
    const freshItems = freshPayload.items.filter(eligible).slice(0, 12);
    const playlistVideoIds = new Set(playlistItems.map(item => item.id.videoId));
    const items = [...playlistItems, ...freshItems.filter(item => !playlistVideoIds.has(item.id.videoId))];
    if (!items.length) throw new Error('No eligible music');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return response.status(200).json({ items });
  } catch (error) {
    return response.status(502).json({ error: 'Unable to load fresh Bhojpuri music' });
  }
};
