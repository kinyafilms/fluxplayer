import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { EventEmitter } from 'eventemitter3';
import { FluxUI } from '../ui/FluxUI';
import { Icons } from '../ui/icons';
import type { FluxPlayerOptions, FluxEvents } from '../types';

export class FluxPlayer extends EventEmitter<FluxEvents> {
  public art: Artplayer;
  private hls: Hls | null = null;

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
        .art-notice { color: #00FFFF !important; font-weight: bold !important; text-shadow: 0 0 10px rgba(0,255,255,0.5) !important; }
        .art-progress-played { background: #00FFFF !important; }
        .art-progress-indicator { background: #00FFFF !important; border: none !important; box-shadow: 0 0 8px #00FFFF !important; }
      `;
      document.head.appendChild(style);
    }

    // 2. Initialize with "Clean Slate" (No default controls)
    this.art = new Artplayer({
      ...artOptions,
      container,
      url,
      theme: '#00FFFF',
      autoSize: true,
      fullscreenWeb: true,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      controls: [], // THE MASTER SWITCH: Disables all default Artplayer UI buttons
      icons: {
        loading: Icons.play, // Use play icon as a clean loader for now
        state: Icons.play,
        indicator: '<div style="width: 12px; height: 12px; background: #00FFFF; border-radius: 50%;"></div>',
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
      this.art.notice.show = 'FLUX MASTER UI LOADED';
      console.log('FLUX: Clean Slate Active');
    });

    this.initEvents();
  }

  private handleHls(video: HTMLMediaElement, url: string, art: Artplayer) {
    if (Hls.isSupported()) {
      if (this.hls) this.hls.destroy();
      const hls = new Hls();
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
  }

  public play() { this.art.play(); }
  public pause() { this.art.pause(); }
  public seek(time: number) { this.art.currentTime = time; }
  public destroy() {
    this.art.destroy();
    if (this.hls) this.hls.destroy();
  }
}
