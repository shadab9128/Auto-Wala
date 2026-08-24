const PRESENCE_KEY = 'bhaukaal:active-visitors';
const TTL_MS = 70_000;

async function redis(commands) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Redis is not configured');
  const response = await fetch(`${url}/pipeline`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(commands) });
  if (!response.ok) throw new Error('Redis request failed');
  return response.json();
}

module.exports = async (request, response) => {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST required' });
  const visitorId = String(request.body?.visitorId || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  if (!visitorId) return response.status(400).json({ error: 'visitorId required' });
  const now = Date.now();
  try {
    const result = await redis([
      ['ZADD', PRESENCE_KEY, now, visitorId],
      ['ZREMRANGEBYSCORE', PRESENCE_KEY, 0, now - TTL_MS],
      ['ZCARD', PRESENCE_KEY],
      ['EXPIRE', PRESENCE_KEY, 120]
    ]);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ online: Number(result[2]?.result || 0) });
  } catch {
    return response.status(503).json({ error: 'Live presence is not configured' });
  }
};
