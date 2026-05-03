import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { EventEmitter } from 'eventemitter3';
import { FluxUI } from '../ui/FluxUI';
import { Icons } from '../ui/icons';
import { AnalyticsManager } from './Analytics';
import type { FluxPlayerOptions, FluxEvents } from '../types';

export class FluxPlayer extends EventEmitter<FluxEvents> {
  public art: Artplayer;
  private hls: Hls | null = null;
  private analytics: AnalyticsManager | null = null;

  constructor(options: FluxPlayerOptions) {
    super();

    const { container, url, ...artOptions } = options;

    // 1. Force-Inject Essential Global Styles (Clean Slate)
    if (!document.getElementById('flux-master-style')) {
      const style = document.createElement('style');
      style.id = 'flux-master-style';
      style.innerHTML = `
        /* Hide default Artplayer gradients and shadows */
        .art-video-container { background: #000 !important; }
        .art-controls { background: transparent !important; background-image: none !important; }
        .art-notice { color: #1fd6fb !important; font-weight: bold !important; text-shadow: 0 0 10px rgba(31,214,251,0.5) !important; }
        .art-progress-played { background: #1fd6fb !important; }
        .art-progress-indicator { background: #1fd6fb !important; border: none !important; box-shadow: 0 0 8px #1fd6fb !important; }
      `;
      document.head.appendChild(style);
    }

    // 2. Initialize with "Clean Slate" (No default controls)
    this.art = new Artplayer({
      ...artOptions,
      container,
      url,
      theme: '#1fd6fb',
      autoSize: true,
      fullscreenWeb: true,
      muted: false,
      volume: 1,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      controls: [], // THE MASTER SWITCH: Disables all default Artplayer UI buttons
      icons: {
        loading: Icons.loader,
        state: Icons.play,
        indicator: '<div style="width: 12px; height: 12px; background: #00FFFF; border-radius: 50%;"></div>',
        play: Icons.play,
        pause: Icons.pause,
        volume: Icons.volume,
        volumeClose: Icons.mute,
        setting: Icons.settings,
        pip: Icons.pip,
        fullscreenOn: Icons.fullscreen,
        fullscreenOff: Icons.exitFullscreen,
      },
      plugins: [
        FluxUI,
        ...(artOptions.plugins || [])
      ],
      customType: {
        m3u8: (video: HTMLMediaElement, url: string, art: Artplayer) => {
          this.handleHls(video, url, art);
        },
      },
    });

    this.art.on('ready', () => {
      // 3. Branded Console Mark
      console.log(
        `%c FluxPlayer %c v1.2.0 %c https://github.com/kinyafilms0/fluxplayer `,
        'background: #1fd6fb; padding: 2px; border-radius: 3px 0 0 3px; color: #fff; font-weight: bold;',
        'background: #35495e; padding: 2px; color: #fff;',
        'background: transparent; padding: 2px; color: #1fd6fb;'
      );
      this.art.notice.show = 'FLUX MASTER UI LOADED';
      console.log('FLUX: Clean Slate Active');
    });

    if (options.analytics?.enabled) {
      this.analytics = new AnalyticsManager(this.art, options.analytics);
    }

    this.initEvents();
  }

  private handleHls(video: HTMLMediaElement, url: string, art: Artplayer) {
    if (Hls.isSupported()) {
      if (this.hls) this.hls.destroy();
      const hls = new Hls({
        enableWorker: true,
        // Increase retries for manifest but fail fast on levels if they 404
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 1, 
        xhrSetup: (xhr, url) => {
          xhr.withCredentials = false;
        },
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Only restart if the master manifest or a critical segment fails
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
                console.error('FluxPlayer: Fatal manifest load error');
                art.notice.show = 'Network Error: Failed to load playlist';
              } else {
                console.warn('FluxPlayer: Fatal network error, attempting recovery...');
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('FluxPlayer: Fatal media error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              console.error('FluxPlayer: Unrecoverable error', data);
              hls.destroy();
              break;
          }
        }

        // Handle Level Load Errors (404 on specific quality)
        if (data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR) {
          const level = hls.levels[data.level];
          const label = level ? (level.name || level.height + 'P') : 'Unknown';
          
          console.warn(`FluxPlayer: Quality level "${label}" failed to load (404).`);
          
          // If we have other levels, blacklist this one for a while
          if (hls.levels.length > 1) {
            // HLS.js internally handles blacklisting if we report the error
            // But we can also try to force a level switch to avoid "restarts"
            const nextLevel = hls.levels.findIndex((l, i) => i !== data.level);
            if (nextLevel !== -1) {
              console.log(`FluxPlayer: Switching to fallback level...`);
              hls.currentLevel = nextLevel;
            }
          } else {
            art.notice.show = 'Video quality unavailable';
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (hls.levels.length > 0) {
          // Find the highest quality level (by height or bandwidth)
          let highestLevelIndex = 0;
          let maxHeight = 0;
          
          hls.levels.forEach((level, index) => {
            if (level.height > maxHeight) {
              maxHeight = level.height;
              highestLevelIndex = index;
            }
          });

          console.log(`FluxPlayer: Defaulting to highest quality level: ${maxHeight}P (Level ${highestLevelIndex})`);
          hls.startLevel = highestLevelIndex;
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      this.hls = hls;
      (art as any).hls = hls;
      art.on('destroy', () => hls.destroy());
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    }
  }

  private initEvents() {
    this.art.on('video:play', () => this.emit('play'));
    this.art.on('video:pause', () => this.emit('pause'));
    this.art.on('video:ended', () => this.emit('ended'));
    this.art.on('video:timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.art.currentTime,
        duration: this.art.duration,
      });
    });
    this.art.on('error', (error) => this.emit('error', error));
    this.art.on('analytics:event', (payload) => this.emit('analytics:event', payload));
  }

  public play() { this.art.play(); }
  public pause() { this.art.pause(); }
  public seek(time: number) { this.art.currentTime = time; }

  /**
   * Get current playback time in seconds
   */
  get currentTime(): number {
    return this.art.currentTime;
  }

  /**
   * Get total video duration in seconds
   */
  get duration(): number {
    return this.art.duration;
  }
  public destroy() {
    this.art.destroy();
    if (this.hls) this.hls.destroy();
    if (this.analytics) this.analytics.destroy();
  }
}
