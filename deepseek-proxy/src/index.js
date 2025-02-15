export default {
  async fetch(request, env) {
    // Only allow requests from your domain
    const allowedOrigin = 'https://gareginmazmanyan.com';
    const origin = request.headers.get('Origin');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      if (origin !== allowedOrigin) {
        return new Response('Unauthorized', { status: 403 });
      }

      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Only allow POST requests for actual data
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Verify origin for POST requests
    if (origin !== allowedOrigin) {
      return new Response('Unauthorized', { status: 403 });
    }

    try {
      // Forward the request to DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`
        },
        body: request.body
      });

      // Get the response data
      const data = await response.json();

      // Return the response with CORS headers
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin
        }
      });
    }
  }
};
