export default async function handler(req, res) {
    // Set CORS headers for the proxy response
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;

    if (!url) {
        res.status(400).json({ error: 'Missing "url" query parameter' });
        return;
    }

    try {
        const targetUrl = new URL(url);

        // Prepare headers
        const headers = new Headers();
        Object.entries(req.headers).forEach(([key, value]) => {
            // Filter out headers that shouldn't be forwarded or need to be overridden
            if (!['host', 'origin', 'referer', 'content-length'].includes(key)) {
                headers.set(key, value);
            }
        });

        // Explicitly set Host header to target
        headers.set('Host', targetUrl.host);

        // Prepare body
        let body;
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const contentType = req.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                body = JSON.stringify(req.body);
            } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
                body = new URLSearchParams(req.body).toString();
            } else {
                // Fallback for text or other types if Vercel didn't parse it, 
                // or if we need to handle raw body (which is harder in Vercel functions without config)
                body = req.body;
                if (typeof body === 'object') {
                    body = JSON.stringify(body); // Fallback
                }
            }
        }

        const response = await fetch(targetUrl.toString(), {
            method: req.method,
            headers: headers,
            body: body,
        });

        // Forward response headers
        response.headers.forEach((value, key) => {
            // Avoid duplicate CORS headers from the target
            if (!key.toLowerCase().startsWith('access-control-')) {
                res.setHeader(key, value);
            }
        });

        // Send response
        const responseBody = await response.arrayBuffer();
        res.status(response.status).send(Buffer.from(responseBody));

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed', details: error.message });
    }
}
