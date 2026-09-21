export default function handler(request, response) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return response.status(503).json({ error: 'Authentication is not configured.' });
  }

  response.setHeader('Cache-Control', 'no-store');
  return response.status(200).json({ publishableKey });
}
