import type { Option } from 'artplayer';

export interface FluxPlayerOptions extends Partial<Option> {
  container: string | HTMLDivElement;
  url: string;
  logoUrl?: string;
  logoAlt?: string;
  logoLabel?: string;
}

export type FluxEvents = {
  play: void;
  pause: void;
  timeupdate: { currentTime: number; duration: number };
  ended: void;
  error: any;
  qualityChange: { level: number; name: string };
  loadStart: string;
};
