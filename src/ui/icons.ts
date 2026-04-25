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
  Search,
  ArrowLeft,
  RotateCcw,
  RotateCw,
  ChevronRight,
  Loader
} from 'lucide-static';

function wrap(svg: string, fill: boolean = false) {
  // Remove hardcoded width and height so it scales in Artplayer
  let res = svg
    .replace('width="24"', 'width="100%"')
    .replace('height="24"', 'height="100%"');
  
  if (fill) {
    res = res.replace(/fill="none"/g, 'fill="currentColor"');
  }
  return res;
}

export const Icons = {
  play: wrap(Play, true),
  pause: wrap(Pause, true),
  volume: wrap(Volume2),
  mute: wrap(VolumeX),
  cc: wrap(Subtitles),
  settings: wrap(Settings),
  pip: wrap(Monitor),
  theater: wrap(Maximize2),
  fullscreen: wrap(Maximize),
  exitFullscreen: wrap(Minimize),
  search: wrap(Search),
  back: wrap(ArrowLeft),
  rewind: wrap(RotateCcw),
  forward: wrap(RotateCw),
  next: wrap(ChevronRight),
  loader: wrap(Loader)
};
