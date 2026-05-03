import type { Option } from 'artplayer';

export interface AnalyticsOptions {
  enabled: boolean;
  videoId: string;
  userId?: string;
  endpoint?: string;
  heartbeatInterval?: number;
  metadata?: Record<string, any>;
}

export interface FluxPlayerOptions extends Partial<Option> {
  container: string | HTMLDivElement;
  url: string;
  logoUrl?: string;
  logoAlt?: string;
  logoLabel?: string;
  analytics?: AnalyticsOptions;
}

export type FluxEvents = {
  play: void;
  pause: void;
  timeupdate: { currentTime: number; duration: number };
  ended: void;
  error: any;
  qualityChange: { level: number; name: string };
  loadStart: string;
  'analytics:event': { event: string; data: any };
};
