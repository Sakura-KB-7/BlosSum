import { createServer } from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.NAVER_SEARCH_PROXY_PORT || 3001);
const HOST = process.env.NAVER_SEARCH_PROXY_HOST || '127.0.0.1';
const CLIENT_ID = process.env.NAVER_SEARCH_CLIENT_ID || process.env.VITE_NAVER_MAP_CLIENT_ID || '';
const CLIENT_SECRET = process.env.NAVER_SEARCH_CLIENT_SECRET || '';

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Invalid request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method !== 'GET' || url.pathname !== '/search/local') {
    sendJson(res, 404, { message: 'Not found' });
    return;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    sendJson(res, 500, {
      message: 'NAVER_SEARCH_CLIENT_ID or NAVER_SEARCH_CLIENT_SECRET is missing',
    });
    return;
  }

  const query = url.searchParams.get('query')?.trim();
  if (!query) {
    sendJson(res, 400, { message: 'query is required' });
    return;
  }

  try {
    const upstreamUrl = new URL('https://openapi.naver.com/v1/search/local.json');
    upstreamUrl.searchParams.set('query', query);
    upstreamUrl.searchParams.set('display', url.searchParams.get('display') || '10');
    upstreamUrl.searchParams.set('start', '1');
    upstreamUrl.searchParams.set('sort', url.searchParams.get('sort') || 'comment');

    const response = await fetch(upstreamUrl, {
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET,
      },
    });

    const data = await response.json();
    sendJson(res, response.status, data);
  } catch (error) {
    sendJson(res, 502, { message: 'Failed to fetch Naver local search results' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Naver search proxy listening on http://${HOST}:${PORT}`);
});
