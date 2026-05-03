import Artplayer from 'artplayer';
import type { AnalyticsOptions } from '../types';

export class AnalyticsManager {
  private art: Artplayer;
  private options: AnalyticsOptions;
  private isStarted = false;
  private totalWatchTime = 0;
  private lastHeartbeatTime = 0;
  private heartbeatTimer: any = null;
  private milestones = new Set([25, 50, 75, 100]);
  private reachedMilestones = new Set<number>();
  private bufferingStartTime: number | null = null;
  private sessionId: string;

  constructor(art: Artplayer, options: AnalyticsOptions) {
    this.art = art;
    this.options = {
      heartbeatInterval: 10,
      ...options,
    };
    this.sessionId = Math.random().toString(36).substring(2, 15);
    this.init();
  }

  private init() {
    this.art.on('video:play', () => {
      if (!this.isStarted) {
        this.report('view', { videoId: this.options.videoId });
        this.isStarted = true;
      }
    });

    this.art.on('video:playing', () => {
      this.startHeartbeat();
    });

    this.art.on('video:pause', () => this.stopHeartbeat());
    this.art.on('video:waiting', () => {
      this.stopHeartbeat();
      this.bufferingStartTime = Date.now();
    });

    this.art.on('video:ended', () => {
      this.stopHeartbeat();
      this.report('completed', { videoId: this.options.videoId });
    });

    this.art.on('video:timeupdate', () => this.checkMilestones());
    
    this.art.on('video:waiting', () => {
      this.bufferingStartTime = Date.now();
    });

    this.art.on('video:playing', () => {
      if (this.bufferingStartTime) {
        const duration = (Date.now() - this.bufferingStartTime) / 1000;
        this.report('buffering', { duration });
        this.bufferingStartTime = null;
      }
    });

    // Handle page exit
    window.addEventListener('beforeunload', () => this.report('exit', { finalWatchTime: this.totalWatchTime }));
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) return;
    this.lastHeartbeatTime = Date.now();
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      const delta = (now - this.lastHeartbeatTime) / 1000;
      this.totalWatchTime += delta;
      this.lastHeartbeatTime = now;
      
      this.report('heartbeat', {
        watchTime: delta,
        totalWatchTime: this.totalWatchTime,
        currentTime: this.art.currentTime,
      });
    }, (this.options.heartbeatInterval || 10) * 1000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private checkMilestones() {
    const progress = (this.art.currentTime / this.art.duration) * 100;
    for (const milestone of this.milestones) {
      if (progress >= milestone && !this.reachedMilestones.has(milestone)) {
        this.reachedMilestones.add(milestone);
        this.report('milestone', { milestone, progress });
      }
    }
  }

  private report(event: string, data: any) {
    const payload = {
      event,
      sessionId: this.sessionId,
      videoId: this.options.videoId,
      userId: this.options.userId,
      timestamp: new Date().toISOString(),
      metadata: this.options.metadata,
      ...data,
    };

    // Emit event for local hooks
    this.art.emit('analytics:event', payload);

    // Send to endpoint if configured
    if (this.options.endpoint) {
      if (event === 'exit') {
        navigator.sendBeacon(this.options.endpoint, JSON.stringify(payload));
      } else {
        fetch(this.options.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {}); // Silently fail if endpoint is down
      }
    }

    console.debug(`[Analytics] ${event}`, payload);
  }

  public destroy() {
    this.stopHeartbeat();
  }
}
