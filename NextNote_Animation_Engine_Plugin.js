/**
 * NextNote Animation Engine Plugin
 * Timeline-based animation system with keyframes and effects
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Animation Engine',
  version: '1.0.0',
  description: 'Timeline-based animation system with keyframes, effects, and playback',
  
  onLoad(app) {
    this.animations = JSON.parse(localStorage.getItem('nextnote_animations') || '[]');
    this.currentTimeline = null;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 5000; // 5 seconds default
    this.fps = 60;
    this.animationFrame = null;
    this.setupAnimationEngineUI(app);
    this.initializeAnimationComponents(app);
    this.bindAnimationEvents(app);
  },

  setupAnimationEngineUI(app) {
    const panel = app.createPanel('animation-engine', 'Animation Engine');
    
    // Header with animation theme
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
      border-radius: 12px;
      color: white;
      position: relative;
      overflow: hidden;
    `;

    // Animated background
    const animatedBg = document.createElement('div');
    animatedBg.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: shimmer 3s infinite;
      pointer-events: none;
    `;
    header.appendChild(animatedBg);

    const title = document.createElement('h3');
    title.style.cssText = `
      margin: 0; 
      color: white; 
      display: flex; 
      align-items: center; 
      gap: 10px;
      z-index: 1;
      position: relative;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      font-family: 'Comic Sans MS', cursive, sans-serif;
    `;
    title.innerHTML = '🎬 Animation Engine';

    const playbackControls = document.createElement('div');
    playbackControls.style.cssText = `
      display: flex;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const playBtn = document.createElement('button');
    playBtn.id = 'animation-play-btn';
    playBtn.style.cssText = `
      padding: 8px 12px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    playBtn.innerHTML = '▶️ Play';
    playBtn.addEventListener('click', () => this.togglePlayback(app));

    const stopBtn = document.createElement('button');
    stopBtn.style.cssText = `
      padding: 8px 12px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    stopBtn.innerHTML = '⏹️ Stop';
    stopBtn.addEventListener('click', () => this.stopPlayback(app));

    playbackControls.appendChild(playBtn);
    playbackControls.appendChild(stopBtn);

    header.appendChild(title);
    header.appendChild(playbackControls);
    panel.appendChild(header);

    // Timeline interface
    const timelineSection = document.createElement('div');
    timelineSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    timelineSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">⏱️ Timeline</h4>
      
      <!-- Timeline Controls -->
      <div style="display: flex; gap: 15px; align-items: center; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--hermes-text); font-weight: bold;">Duration:</label>
          <input type="number" id="animation-duration" value="5" min="1" max="60" style="
            width: 60px;
            padding: 5px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-input-bg);
            color: var(--hermes-text);
          "> seconds
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="color: var(--hermes-text); font-weight: bold;">FPS:</label>
          <select id="animation-fps" style="
            padding: 5px;
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
            background: var(--hermes-input-bg);
            color: var(--hermes-text);
          ">
            <option value="30">30 FPS</option>
            <option value="60" selected>60 FPS</option>
            <option value="120">120 FPS</option>
          </select>
        </div>
        
        <button onclick="this.addKeyframe()" style="
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-success-text);
          color: white;
          cursor: pointer;
          font-weight: bold;
        ">+ Add Keyframe</button>
      </div>

      <!-- Timeline Scrubber -->
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span style="color: var(--hermes-text); font-size: 0.9em;">0s</span>
          <span id="current-time-display" style="color: var(--hermes-highlight-bg); font-weight: bold;">0.0s</span>
          <span id="duration-display" style="color: var(--hermes-text); font-size: 0.9em;">5.0s</span>
        </div>
        <input type="range" id="timeline-scrubber" min="0" max="5000" value="0" style="
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--hermes-border);
          outline: none;
          -webkit-appearance: none;
        ">
      </div>

      <!-- Timeline Track -->
      <div id="timeline-track" style="
        height: 200px;
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        border: 2px solid var(--hermes-border);
        border-radius: 8px;
        position: relative;
        overflow-x: auto;
        overflow-y: hidden;
      ">
        <div id="timeline-content" style="
          width: 100%;
          height: 100%;
          position: relative;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 49px,
            var(--hermes-border) 49px,
            var(--hermes-border) 50px
          );
        ">
          <div id="playhead" style="
            position: absolute;
            top: 0;
            left: 0;
            width: 2px;
            height: 100%;
            background: #ff6b6b;
            z-index: 100;
            pointer-events: none;
          "></div>
        </div>
      </div>
    `;

    panel.appendChild(timelineSection);

    // Animation Effects Library
    const effectsSection = document.createElement('div');
    effectsSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    `;

    effectsSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">✨ Animation Effects</h4>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      ">
        ${this.generateEffectButtons()}
      </div>

      <div style="margin-bottom: 15px;">
        <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">🎨 Text Effects</h5>
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
        ">
          ${this.generateTextEffectButtons()}
        </div>
      </div>

      <div>
        <h5 style="margin: 0 0 10px 0; color: var(--hermes-text);">🌟 Special Effects</h5>
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 8px;
        ">
          ${this.generateSpecialEffectButtons()}
        </div>
      </div>
    `;

    panel.appendChild(effectsSection);

    // Keyframe Editor
    const keyframeSection = document.createElement('div');
    keyframeSection.style.cssText = `
      background: var(--hermes-panel-bg);
      border: 1px solid var(--hermes-border);
      border-radius: 8px;
      padding: 20px;
    `;

    keyframeSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🎯 Keyframe Editor</h4>
      
      <div id="keyframe-list" style="
        min-height: 150px;
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 15px;
      ">
        <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic;">
          No keyframes yet. Add keyframes to create animations!
        </div>
      </div>

      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button onclick="this.clearAllKeyframes()" style="
          padding: 8px 16px;
          border: 1px solid var(--hermes-border);
          border-radius: 4px;
          background: var(--hermes-button-bg);
          color: var(--hermes-text);
          cursor: pointer;
        ">Clear All</button>
        
        <button onclick="this.exportAnimation()" style="
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-info-text);
          color: white;
          cursor: pointer;
        ">Export Animation</button>
        
        <button onclick="this.importAnimation()" style="
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: var(--hermes-warning-text);
          color: white;
          cursor: pointer;
        ">Import Animation</button>
      </div>
    `;

    panel.appendChild(keyframeSection);

    // Bind timeline events
    this.bindTimelineEvents();
  },

  generateEffectButtons() {
    const effects = [
      { id: 'fade-in', name: 'Fade In', icon: '🌅', color: '#4ecdc4' },
      { id: 'fade-out', name: 'Fade Out', icon: '🌆', color: '#ff6b6b' },
      { id: 'slide-left', name: 'Slide Left', icon: '⬅️', color: '#45b7d1' },
      { id: 'slide-right', name: 'Slide Right', icon: '➡️', color: '#45b7d1' },
      { id: 'slide-up', name: 'Slide Up', icon: '⬆️', color: '#96ceb4' },
      { id: 'slide-down', name: 'Slide Down', icon: '⬇️', color: '#96ceb4' },
      { id: 'zoom-in', name: 'Zoom In', icon: '🔍', color: '#feca57' },
      { id: 'zoom-out', name: 'Zoom Out', icon: '🔎', color: '#feca57' },
      { id: 'rotate', name: 'Rotate', icon: '🔄', color: '#ff9ff3' },
      { id: 'bounce', name: 'Bounce', icon: '⚡', color: '#54a0ff' },
      { id: 'shake', name: 'Shake', icon: '📳', color: '#ff6348' },
      { id: 'pulse', name: 'Pulse', icon: '💓', color: '#ff4757' }
    ];

    return effects.map(effect => `
      <button onclick="this.applyEffect('${effect.id}')" style="
        padding: 10px;
        border: none;
        border-radius: 6px;
        background: ${effect.color};
        color: white;
        cursor: pointer;
        font-size: 12px;
        text-align: center;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        <span style="font-size: 16px;">${effect.icon}</span>
        <span>${effect.name}</span>
      </button>
    `).join('');
  },

  generateTextEffectButtons() {
    const textEffects = [
      { id: 'typewriter', name: 'Typewriter', icon: '⌨️', color: '#667eea' },
      { id: 'rainbow', name: 'Rainbow', icon: '🌈', color: '#764ba2' },
      { id: 'glow', name: 'Glow', icon: '✨', color: '#f093fb' },
      { id: 'shadow', name: 'Shadow', icon: '🌑', color: '#5f27cd' },
      { id: 'outline', name: 'Outline', icon: '⭕', color: '#00d2d3' },
      { id: 'wave', name: 'Wave', icon: '🌊', color: '#ff9ff3' }
    ];

    return textEffects.map(effect => `
      <button onclick="this.applyTextEffect('${effect.id}')" style="
        padding: 8px;
        border: none;
        border-radius: 4px;
        background: ${effect.color};
        color: white;
        cursor: pointer;
        font-size: 10px;
        text-align: center;
        transition: all 0.2s;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        ${effect.icon} ${effect.name}
      </button>
    `).join('');
  },

  generateSpecialEffectButtons() {
    const specialEffects = [
      { id: 'particles', name: 'Particles', icon: '✨', color: '#ff6b6b' },
      { id: 'trail', name: 'Trail', icon: '💫', color: '#4ecdc4' },
      { id: 'morph', name: 'Morph', icon: '🔄', color: '#45b7d1' },
      { id: 'explode', name: 'Explode', icon: '💥', color: '#ff4757' },
      { id: 'dissolve', name: 'Dissolve', icon: '🌫️', color: '#96ceb4' },
      { id: 'warp', name: 'Warp', icon: '🌀', color: '#feca57' }
    ];

    return specialEffects.map(effect => `
      <button onclick="this.applySpecialEffect('${effect.id}')" style="
        padding: 8px;
        border: none;
        border-radius: 4px;
        background: ${effect.color};
        color: white;
        cursor: pointer;
        font-size: 10px;
        text-align: center;
        transition: all 0.2s;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        ${effect.icon} ${effect.name}
      </button>
    `).join('');
  },

  bindTimelineEvents() {
    // Duration change
    const durationInput = document.getElementById('animation-duration');
    if (durationInput) {
      durationInput.addEventListener('change', (e) => {
        this.duration = parseFloat(e.target.value) * 1000;
        this.updateTimelineDisplay();
      });
    }

    // FPS change
    const fpsSelect = document.getElementById('animation-fps');
    if (fpsSelect) {
      fpsSelect.addEventListener('change', (e) => {
        this.fps = parseInt(e.target.value);
      });
    }

    // Timeline scrubber
    const scrubber = document.getElementById('timeline-scrubber');
    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        this.currentTime = parseFloat(e.target.value);
        this.updatePlayhead();
        this.updateCurrentTimeDisplay();
      });
    }
  },

  togglePlayback(app) {
    if (this.isPlaying) {
      this.pausePlayback(app);
    } else {
      this.startPlayback(app);
    }
  },

  startPlayback(app) {
    this.isPlaying = true;
    const playBtn = document.getElementById('animation-play-btn');
    if (playBtn) {
      playBtn.innerHTML = '⏸️ Pause';
    }

    const startTime = performance.now() - this.currentTime;
    
    const animate = (currentTime) => {
      if (!this.isPlaying) return;

      this.currentTime = currentTime - startTime;
      
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.stopPlayback(app);
        return;
      }

      this.updatePlayhead();
      this.updateCurrentTimeDisplay();
      this.applyAnimationAtTime(this.currentTime);

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
    app.showToast('Animation playing...', 'info');
  },

  pausePlayback(app) {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const playBtn = document.getElementById('animation-play-btn');
    if (playBtn) {
      playBtn.innerHTML = '▶️ Play';
    }
    
    app.showToast('Animation paused', 'info');
  },

  stopPlayback(app) {
    this.isPlaying = false;
    this.currentTime = 0;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const playBtn = document.getElementById('animation-play-btn');
    if (playBtn) {
      playBtn.innerHTML = '▶️ Play';
    }
    
    this.updatePlayhead();
    this.updateCurrentTimeDisplay();
    app.showToast('Animation stopped', 'info');
  },

  updatePlayhead() {
    const playhead = document.getElementById('playhead');
    const scrubber = document.getElementById('timeline-scrubber');
    
    if (playhead && scrubber) {
      const percentage = (this.currentTime / this.duration) * 100;
      playhead.style.left = percentage + '%';
      scrubber.value = this.currentTime;
    }
  },

  updateCurrentTimeDisplay() {
    const display = document.getElementById('current-time-display');
    if (display) {
      display.textContent = (this.currentTime / 1000).toFixed(1) + 's';
    }
  },

  updateTimelineDisplay() {
    const durationDisplay = document.getElementById('duration-display');
    const scrubber = document.getElementById('timeline-scrubber');
    
    if (durationDisplay) {
      durationDisplay.textContent = (this.duration / 1000).toFixed(1) + 's';
    }
    
    if (scrubber) {
      scrubber.max = this.duration;
    }
  },

  applyEffect(effectId) {
    // This would apply the selected effect to the currently selected object
    console.log(`Applying effect: ${effectId}`);
    // Implementation would depend on the Visual Card Studio plugin
  },

  applyTextEffect(effectId) {
    console.log(`Applying text effect: ${effectId}`);
    // Implementation for text-specific effects
  },

  applySpecialEffect(effectId) {
    console.log(`Applying special effect: ${effectId}`);
    // Implementation for special effects
  },

  addKeyframe() {
    const time = this.currentTime;
    // This would add a keyframe at the current time
    console.log(`Adding keyframe at ${time}ms`);
  },

  clearAllKeyframes() {
    if (confirm('Are you sure you want to clear all keyframes?')) {
      this.animations = [];
      this.saveAnimations();
      this.updateKeyframeList();
    }
  },

  exportAnimation() {
    const animationData = {
      duration: this.duration,
      fps: this.fps,
      keyframes: this.animations
    };
    
    const blob = new Blob([JSON.stringify(animationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importAnimation() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const animationData = JSON.parse(e.target.result);
            this.duration = animationData.duration || 5000;
            this.fps = animationData.fps || 60;
            this.animations = animationData.keyframes || [];
            this.updateTimelineDisplay();
            this.updateKeyframeList();
          } catch (error) {
            alert('Invalid animation file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  },

  applyAnimationAtTime(time) {
    // This would apply all animations at the specified time
    // Implementation would work with the Visual Card Studio plugin
  },

  updateKeyframeList() {
    const keyframeList = document.getElementById('keyframe-list');
    if (keyframeList) {
      if (this.animations.length === 0) {
        keyframeList.innerHTML = `
          <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic;">
            No keyframes yet. Add keyframes to create animations!
          </div>
        `;
      } else {
        keyframeList.innerHTML = this.animations.map((keyframe, index) => `
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin-bottom: 5px;
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 4px;
          ">
            <span style="color: var(--hermes-text);">Keyframe ${index + 1} - ${(keyframe.time / 1000).toFixed(1)}s</span>
            <button onclick="this.deleteKeyframe(${index})" style="
              padding: 4px 8px;
              border: none;
              border-radius: 3px;
              background: var(--hermes-error-text);
              color: white;
              cursor: pointer;
              font-size: 0.8em;
            ">Delete</button>
          </div>
        `).join('');
      }
    }
  },

  deleteKeyframe(index) {
    this.animations.splice(index, 1);
    this.saveAnimations();
    this.updateKeyframeList();
  },

  saveAnimations() {
    localStorage.setItem('nextnote_animations', JSON.stringify(this.animations));
  },

  initializeAnimationComponents(app) {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      #timeline-scrubber::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ff6b6b;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
      
      #timeline-scrubber::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ff6b6b;
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);
  },

  bindAnimationEvents(app) {
    // Listen for animation events
    app.on('animationUpdated', () => {
      this.saveAnimations();
    });
  }
});
