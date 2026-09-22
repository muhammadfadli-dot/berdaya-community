import https from 'node:https';

const clerkHost = 'frontend-api.clerk.dev';
const clerkProxyUrl = 'https://berdaya.dayalima.com/__clerk';

export default function handler(request, response) {
  const path = Array.isArray(request.query.path)
    ? request.query.path.join('/')
    : request.query.path || '';
  const headers = { ...request.headers };

  delete headers.host;
  headers.host = clerkHost;
  headers['clerk-proxy-url'] = clerkProxyUrl;
  headers['clerk-secret-key'] = process.env.CLERK_SECRET_KEY;
  headers['x-forwarded-for'] = request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || '127.0.0.1';

  const upstream = https.request(
    `https://${clerkHost}/${path}`,
    { method: request.method, headers },
    (upstreamResponse) => {
      response.statusCode = upstreamResponse.statusCode || 502;
      Object.entries(upstreamResponse.headers).forEach(([name, value]) => {
        if (value !== undefined && name !== 'transfer-encoding') response.setHeader(name, value);
      });
      upstreamResponse.pipe(response);
    },
  );

  upstream.on('error', () => response.status(502).json({ error: 'Authentication proxy unavailable.' }));
  request.pipe(upstream);
}
