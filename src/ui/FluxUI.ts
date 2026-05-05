import Artplayer from 'artplayer';
import { Icons } from './icons';
import './styles/main.css';

export function FluxUI(art: Artplayer) {
  // 1. Remove all default Artplayer controls
  const defaults = ['playAndPause', 'volume', 'time', 'setting', 'pip', 'fullscreen', 'fullscreenWeb'];
  defaults.forEach(item => {
    try { art.controls.remove(item); } catch (e) {}
  });

  // 2. ADD LAYERS FOR NEW UI
  
  // TOP BAR LAYER
  art.layers.add({
    name: 'flux-top-bar',
    html: `
      <div class="flux-top-bar">
        <div class="flux-top-left"></div>
        <div class="flux-btn-group">
          <div class="flux-volume-wrapper">
            <div class="flux-volume-btn">${Icons.volume}</div>
            <div class="flux-volume-slider-container">
               <input type="range" class="flux-volume-slider" min="0" max="1" step="0.05" value="${art.volume}">
            </div>
          </div>
          <div class="flux-quality-wrapper">
            <div class="flux-quality-btn">
              ${Icons.settings}
              <span class="flux-quality-current">Auto</span>
            </div>
            <div class="flux-quality-menu"></div>
          </div>
          <div class="flux-fullscreen-btn">${Icons.fullscreen}</div>
        </div>
        <div class="flux-top-right"></div>
      </div>
    `,
    mounted: ($el) => {
      const volBtn = $el.querySelector('.flux-volume-btn');
      const volSlider = $el.querySelector('.flux-volume-slider') as HTMLInputElement;
      
      if (volBtn) {
        art.on('video:volumechange', () => {
          volBtn.innerHTML = art.muted ? Icons.mute : Icons.volume;
          if (volSlider) {
            volSlider.value = art.volume.toString();
            volSlider.style.setProperty('--vol-percent', `${art.volume * 100}%`);
            volSlider.style.background = `linear-gradient(to right, var(--color-flux-blue) 0%, var(--color-flux-blue) ${art.volume * 100}%, rgba(255, 255, 255, 0.2) ${art.volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`;
          }
        });
        volBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wrapper = volBtn.closest('.flux-volume-wrapper');
            if (wrapper) {
                // On mobile, first tap expands, second tap mutes (or just stays expanded)
                wrapper.classList.toggle('is-expanded');
            }
            art.muted = !art.muted;
        });
      }

      if (volSlider) {
        // Initialize percent
        volSlider.style.setProperty('--vol-percent', `${art.volume * 100}%`);
        
        volSlider.addEventListener('input', () => {
          art.volume = parseFloat(volSlider.value);
          volSlider.style.setProperty('--vol-percent', `${art.volume * 100}%`);
          if (art.volume > 0) art.muted = false;
        });

        // Prevent UI hiding while interacting
        const keepVisible = () => { (art as any).autoHide = false; };
        const allowHide = () => { (art as any).autoHide = true; };
        volSlider.addEventListener('mousedown', keepVisible);
        volSlider.addEventListener('touchstart', keepVisible);
        window.addEventListener('mouseup', allowHide);
        window.addEventListener('touchend', allowHide);

        volSlider.addEventListener('click', (e) => e.stopPropagation());
      }
      $el.querySelector('.flux-fullscreen-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        art.fullscreen = !art.fullscreen;
      });

      // Quality Toggle
      const qualityBtn = $el.querySelector('.flux-quality-btn');
      const qualityMenu = $el.querySelector('.flux-quality-menu');
      const qualityWrapper = $el.querySelector('.flux-quality-wrapper');

      qualityBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        // Only toggle menu if there's something to select (more than 1 level or multiple URLs)
        const items = qualityMenu?.querySelectorAll('.flux-quality-item');
        if (items && items.length > 1) {
            qualityWrapper?.classList.toggle('is-open');
        }
      });

      // Close menu when clicking outside
      window.addEventListener('click', () => {
        qualityWrapper?.classList.remove('is-open');
      });

      // Populate Quality Menu
      const qualityCurrent = $el.querySelector('.flux-quality-current');
      const updateQualityMenu = () => {
        if (!qualityMenu) return;
        
        let html = '';
        let currentLabel = 'Auto';
        
        // If HLS levels exist, we only want to show the highest one as it's the only one working
        const hls = (art as any).hls;
        if (hls && hls.levels && hls.levels.length > 0) {
            // Find the highest quality level
            let highestIndex = 0;
            let maxHeight = 0;
            hls.levels.forEach((level: any, index: number) => {
                if (level.height > maxHeight) {
                    maxHeight = level.height;
                    highestIndex = index;
                }
            });

            const level = hls.levels[highestIndex];
            const label = level.name || (level.height ? `${level.height}P` : 'HD');
            
            // Only show this single working quality
            html = `<div class="flux-quality-item is-active" data-level="${highestIndex}">${label}</div>`;
            currentLabel = label;
        } else if (art.option.quality && art.option.quality.length > 0) {
            art.option.quality.forEach((item: any) => {
                const isActive = art.option.url === item.url;
                html += `<div class="flux-quality-item ${isActive ? 'is-active' : ''}" data-url="${item.url}">${item.html}</div>`;
                if (isActive) currentLabel = item.html;
            });
        }

        if (qualityCurrent) qualityCurrent.textContent = currentLabel;
        qualityMenu.innerHTML = html;
        
        // Add/remove class for CSS styling (e.g. cursor)
        const items = qualityMenu.querySelectorAll('.flux-quality-item');
        if (items.length > 1) {
            qualityWrapper?.classList.remove('no-menu');
        } else {
            qualityWrapper?.classList.add('no-menu');
        }

        // Bind clicks
        qualityMenu.querySelectorAll('.flux-quality-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const level = (item as HTMLElement).dataset.level;
                const url = (item as HTMLElement).dataset.url;

                if (level !== undefined && hls) {
                    art.loading.show = true;
                    (art as any).container.classList.add('flux-is-loading');
                    hls.currentLevel = parseInt(level);
                    // Quality switch removal is handled in FluxPlayer.ts
                } else if (url) {
                    art.loading.show = true;
                    (art as any).container.classList.add('flux-is-loading');
                    art.switchQuality(url);
                }
                
                qualityWrapper?.classList.remove('is-open');
                updateQualityMenu();
            });
        });
      };

      art.on('ready', updateQualityMenu);
      art.on('video:loadedmetadata', updateQualityMenu);

      // Mobile orientation lock on fullscreen and initialization
      const lockOrientation = () => {
        const orientation = screen.orientation as any;
        if (orientation && orientation.lock) {
          orientation.lock('landscape').catch(() => {
            // Silently fail if not supported or gesture missing
          });
        }
      };

      art.on('ready', lockOrientation);
      art.on('video:play', lockOrientation);

      art.on('fullscreen', (state) => {
        const orientation = screen.orientation as any;
        if (state && orientation && orientation.lock) {
          orientation.lock('landscape').catch(() => {
            console.log('Orientation lock not supported');
          });
        } else if (!state && orientation && orientation.unlock) {
          orientation.unlock();
        }
      });
    }
  });

  // CENTER CONTROLS LAYER
  art.layers.add({
    name: 'flux-center-controls',
    html: `
      <div class="flux-center-ui">
        <div class="flux-skip-btn flux-rewind">${Icons.rewind}<span class="skip-val">10</span></div>
        <div class="flux-play-center">${Icons.play}</div>
        <div class="flux-skip-btn flux-forward">${Icons.forward}<span class="skip-val">10</span></div>
      </div>
    `,
    mounted: ($el) => {
      const playBtn = $el.querySelector('.flux-play-center');
      if (playBtn) {
        art.on('video:play', () => playBtn.innerHTML = Icons.pause);
        art.on('video:pause', () => playBtn.innerHTML = Icons.play);
        playBtn.addEventListener('click', () => art.toggle());
      }
      $el.querySelector('.flux-rewind')?.addEventListener('click', (e) => {
        e.stopPropagation();
        art.currentTime = Math.max(0, art.currentTime - 10);
      });
      $el.querySelector('.flux-forward')?.addEventListener('click', (e) => {
        e.stopPropagation();
        art.currentTime = Math.min(art.duration, art.currentTime + 10);
      });
    }
  });

  // BOTTOM INFO LAYER
  art.layers.add({
    name: 'flux-bottom-info',
    html: `
      <div class="flux-bottom-ui">
        <div class="flux-movie-branding">
          <span class="flux-label">${(art.option as any).logoLabel || ''}</span>
          ${(art.option as any).logoUrl ? `
            <img src="${(art.option as any).logoUrl}" class="flux-logo" alt="${(art.option as any).logoAlt || ''}" />
          ` : ''}
        </div>
        <div class="flux-progress-container">
          <div class="flux-time-row">
            <span class="flux-current-time">00:00:00</span>
            <span class="flux-total-time">00:00:00</span>
          </div>
        </div>
      </div>
    `,
    mounted: ($el) => {
      const current = $el.querySelector('.flux-current-time');
      const total = $el.querySelector('.flux-total-time');
      const update = () => {
        if (current) current.textContent = Artplayer.utils.secondToTime(art.currentTime);
        if (total) total.textContent = Artplayer.utils.secondToTime(art.duration);
      };
      art.on('video:timeupdate', update);
      art.on('video:loadedmetadata', update);
    }
  });

  return {
    name: 'FluxUI',
  };
}
