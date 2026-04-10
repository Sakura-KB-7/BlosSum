function sendJson(res, statusCode, body) {
  res.status(statusCode).json(body);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  const clientId = process.env.NAVER_SEARCH_CLIENT_ID || process.env.VITE_NAVER_MAP_CLIENT_ID || '';
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET || '';

  if (!clientId || !clientSecret) {
    sendJson(res, 500, {
      message: 'NAVER_SEARCH_CLIENT_ID or NAVER_SEARCH_CLIENT_SECRET is missing',
    });
    return;
  }

  const query = String(req.query?.query || '').trim();
  if (!query) {
    sendJson(res, 400, { message: 'query is required' });
    return;
  }

  try {
    const upstreamUrl = new URL('https://openapi.naver.com/v1/search/local.json');
    upstreamUrl.searchParams.set('query', query);
    upstreamUrl.searchParams.set('display', String(req.query?.display || '10'));
    upstreamUrl.searchParams.set('start', '1');
    upstreamUrl.searchParams.set('sort', String(req.query?.sort || 'comment'));

    const response = await fetch(upstreamUrl, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    const data = await response.json();
    sendJson(res, response.status, data);
  } catch (error) {
    sendJson(res, 502, { message: 'Failed to fetch Naver local search results' });
  }
}
