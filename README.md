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
import 'fluxplayer/dist/style.css';

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

### HTML Structure

```html
<div id="player" style="width: 100%; height: 500px;"></div>
```

---

## 📦 Publishing to NPM

To get this library on NPM, follow these steps:

### 1. Prepare your Account
If you haven't already, create an account on [npmjs.com](https://www.npmjs.com/) and log in via your terminal:
```bash
npm login
```

### 2. Finalize Package Configuration
Ensure your `package.json` has the correct metadata (Name, Version, Author, etc.). The current configuration is already optimized for library distribution.

### 3. Build the Project
Run the build script to generate the production bundles in the `dist` folder:
```bash
npm run build
```

### 4. Publish
Push the library to the NPM registry:
```bash
npm publish --access public
```

*Note: Every time you want to publish an update, you must increment the `version` number in `package.json`.*

## 📄 License
This project is licensed under the ISC License.