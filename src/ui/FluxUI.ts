import Artplayer from 'artplayer';
import { Icons } from './icons';
import './styles/main.css';

export function FluxUI(art: Artplayer) {
  // 1. SURGICAL REMOVAL (Kill Artplayer defaults by name)
  const defaults = ['play', 'volume', 'setting', 'pip', 'fullscreen', 'web-fullscreen', 'play-and-pause'];
  defaults.forEach(item => {
    try { art.controls.remove(item); } catch (e) {}
  });

  // 2. LEFT CONTROLS reconstruction
  
  // Custom Play/Pause
  art.controls.add({
    name: 'flux-play',
    position: 'left',
    index: 1,
    html: Icons.play,
    mounted: ($el) => {
      art.on('video:play', () => $el.innerHTML = Icons.pause);
      art.on('video:pause', () => $el.innerHTML = Icons.play);
    },
    click: () => art.toggle(),
  });

  // Custom Volume Island
  art.controls.add({
    name: 'flux-volume',
    position: 'left',
    index: 2,
    html: Icons.volume,
    mounted: ($el) => {
      art.on('video:volumechange', () => {
         $el.innerHTML = art.muted || art.volume === 0 ? Icons.mute : Icons.volume;
      });
    },
    click: () => art.muted = !art.muted,
  });

  // Custom Time/Duration
  art.controls.add({
    name: 'flux-time',
    position: 'left',
    index: 3,
    html: '00:00 / 00:00',
    style: {
      fontSize: '13px',
      color: '#00FFFF',
      marginLeft: '10px',
      fontWeight: '600',
      textShadow: '0 0 5px rgba(0,255,255,0.3)',
    },
    mounted: ($el) => {
        const updateTime = () => {
          const current = Artplayer.utils.secondToTime(art.currentTime);
          const total = Artplayer.utils.secondToTime(art.duration);
          $el.innerText = `${current} / ${total}`;
        };
      art.on('video:timeupdate', updateTime);
      art.on('video:loadedmetadata', updateTime);
    },
  });

  // 2. RIGHT CONTROLS

  // Custom Settings (Cyan Glow)
  art.controls.add({
    name: 'flux-settings',
    position: 'right',
    index: 1,
    html: Icons.settings,
    click: () => art.setting.show = !art.setting.show,
  });

  // MiniPlayer (PIP)
  art.controls.add({
    name: 'flux-pip',
    position: 'right',
    index: 2,
    html: Icons.pip,
    click: () => art.pip = !art.pip,
  });

  // Theater Mode
  art.controls.add({
    name: 'flux-theater',
    position: 'right',
    index: 3,
    html: Icons.theater,
    click: () => {
      const isTheater = art.template.$container.classList.toggle('theater-mode');
      art.autoSize();
    },
  });

  // Fullscreen
  art.controls.add({
    name: 'flux-fullscreen',
    position: 'right',
    index: 4,
    html: Icons.fullscreen,
    click: () => art.fullscreen = !art.fullscreen,
  });

  return {
    name: 'FluxUI',
  };
}
