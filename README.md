# FluxPlayer 🎬

FluxPlayer is a premium, high-performance video player skin built on top of [Artplayer](https://artplayer.org/). It features a modern, minimal aesthetic with glassmorphism effects, custom center controls, and advanced mobile optimizations.

![FluxPlayer Preview](https://via.placeholder.com/1200x600/1fd6fb/ffffff?text=FluxPlayer+Premium+UI)

## ✨ Features

- **Modern UI**: Sleek glassmorphism controls with the `#1fd6fb` blue theme.
- **Custom Controls**: Completely redesigned center play/pause and skip buttons.
- **Interactive Volume**: Smooth expand-on-hover volume slider with real-time level filling.
- **Mobile Optimized**: Automatic landscape rotation on fullscreen and touch-friendly interactions.
- **HLS Support**: Built-in support for HLS streaming via `hls.js`.
- **Zero Clutter**: Clean interface with Artplayer default notices and state icons removed.

## 🚀 Installation

Install via NPM:

```bash
npm install fluxplayer
```

Or via Yarn:

```bash
yarn add fluxplayer
```

## 📖 Usage

### Native JavaScript

```javascript
import { FluxPlayer } from 'fluxplayer';
import 'fluxplayer/dist/fluxplayer.css';

const player = new FluxPlayer({
    container: '#player',
    url: 'https://example.com/video.m3u8',
    logoUrl: 'https://example.com/logo.png',
    logoAlt: 'My Movie Title',
    logoLabel: 'Movie',
    autoplay: true,
});

player.on('play', () => {
    console.log('Video is playing!');
});
```

### API & Events

You can easily access the player's state and listen for playback events:

```javascript
// Access current state
console.log('Current Time:', player.currentTime); // In seconds
console.log('Total Duration:', player.duration);  // In seconds

// Listen for time updates
player.on('timeupdate', (data) => {
    console.log(`Progress: ${data.currentTime} / ${data.duration}`);
});

// Control playback
player.play();
player.pause();
player.seek(120); // Seek to 2 minutes
```

### 📊 Analytics
FluxPlayer includes a built-in analytics engine to track user engagement, watch hours, and content performance.

```javascript
const player = new FluxPlayer({
    container: '#player',
    url: 'video.m3u8',
    analytics: {
        enabled: true,
        videoId: 'my-unique-video-id',
        endpoint: 'https://api.yourdomain.com/v1/analytics',
        heartbeatInterval: 10, // Report watch time every 10 seconds
        metadata: {
            category: 'Action',
            series: 'Example Series'
        }
    }
});

// Hook into local analytics events
player.on('analytics:event', (payload) => {
    console.log(`Tracked: ${payload.event}`, payload);
});
```

#### Tracked Metrics:
- **Views**: Sent on the very first play.
- **Heartbeats**: Active watch time updates.
- **Milestones**: Automatic events at 25%, 50%, 75%, and 100% completion.
- **Buffering**: Frequency and duration of playback stalls.
- **Exit Tracking**: Final watch time sent via Beacon API when the user leaves the page.

### 🧪 Local Testing
We provide a playground and a mock server to test your analytics integration:

1. **Start the Mock Server**:
   ```bash
   npm run analytics-server
   ```
2. **Open the Playground**:
   Navigate to `examples/playground.html` in your browser.

---

## 🛠️ Development

---

## 📄 License
This project is licensed under the ISC License.