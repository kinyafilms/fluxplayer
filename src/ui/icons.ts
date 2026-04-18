import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Subtitles, 
  Settings, 
  Monitor, 
  Maximize, 
  Maximize2,
  Minimize,
  Search
} from 'lucide-static';

const ICON_SIZE = 20;
const ICON_STROKE = 2;

function wrap(svg: string) {
  // lucide-static icons are already full SVG strings.
  // We just return them directly.
  return svg;
}

export const Icons = {
  play: wrap(Play),
  pause: wrap(Pause),
  volume: wrap(Volume2),
  mute: wrap(VolumeX),
  cc: wrap(Subtitles),
  settings: wrap(Settings),
  pip: wrap(Monitor),
  theater: wrap(Maximize2),
  fullscreen: wrap(Maximize),
  exitFullscreen: wrap(Minimize),
  search: wrap(Search)
};
