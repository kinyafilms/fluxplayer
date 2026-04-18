import type Option from 'artplayer/types/option';

export interface FluxPlayerOptions extends Partial<Option> {
  container: string | HTMLElement;
  url: string;
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
