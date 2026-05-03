import http from 'http';

/**
 * A simple mock server to test FluxPlayer Analytics
 * This server logs all incoming analytics events to the console.
 */

const PORT = 3001;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/analytics') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const timestamp = new Date().toLocaleTimeString();
                
                console.log(`\x1b[36m[${timestamp}] Analytics Event Received:\x1b[0m`);
                console.log(`  Event: \x1b[32m${data.event}\x1b[0m`);
                console.log(`  Video ID: ${data.videoId}`);
                console.log(`  Session ID: ${data.sessionId}`);
                
                if (data.event === 'heartbeat') {
                    console.log(`  Watch Time: ${data.watchTime}s (Total: ${data.totalWatchTime.toFixed(2)}s)`);
                } else if (data.event === 'milestone') {
                    console.log(`  Milestone Reached: \x1b[35m${data.milestone}%\x1b[0m`);
                } else if (data.event === 'buffering') {
                    console.log(`  Stall Duration: \x1b[31m${data.duration}s\x1b[0m`);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
            } catch (e) {
                console.error('Error parsing analytics data:', e);
                res.writeHead(400);
                res.end('Invalid JSON');
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`\x1b[1m\x1b[34mFluxPlayer Analytics Mock Server running at http://localhost:${PORT}/api/analytics\x1b[0m`);
    console.log('Listening for incoming video events...');
});
