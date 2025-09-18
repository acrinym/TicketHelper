/**
 * NextNote Audio System Plugin
 * Background music, sound effects, and audio timeline management
 * 
 * @version 1.0.0
 * @author Senior Developer
 * @date 2025-09-18
 */

'use strict';

window.registerNextNotePlugin({
  name: 'Audio System',
  version: '1.0.0',
  description: 'Background music, sound effects, and audio timeline management',
  
  onLoad(app) {
    this.audioTracks = JSON.parse(localStorage.getItem('nextnote_audio_tracks') || '[]');
    this.soundEffects = JSON.parse(localStorage.getItem('nextnote_sound_effects') || '[]');
    this.audioSettings = JSON.parse(localStorage.getItem('nextnote_audio_settings') || this.getDefaultSettings());
    this.currentBackgroundMusic = null;
    this.audioContext = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.setupAudioSystemUI(app);
    this.initializeAudioComponents(app);
    this.bindAudioEvents(app);
  },

  getDefaultSettings() {
    return {
      masterVolume: 0.7,
      musicVolume: 0.5,
      effectsVolume: 0.8,
      fadeInDuration: 2000,
      fadeOutDuration: 1000,
      crossfadeDuration: 3000,
      autoPlay: false,
      loop: true
    };
  },

  setupAudioSystemUI(app) {
    const panel = app.createPanel('audio-system', 'Audio System');
    
    // Header with audio theme
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

    // Audio wave animation
    const waveContainer = document.createElement('div');
    waveContainer.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30px;
      overflow: hidden;
      pointer-events: none;
    `;

    for (let i = 0; i < 20; i++) {
      const wave = document.createElement('div');
      wave.style.cssText = `
        position: absolute;
        bottom: 0;
        width: 3px;
        background: rgba(255,255,255,0.3);
        animation: audioWave ${1 + Math.random()}s ease-in-out infinite alternate;
        animation-delay: ${i * 0.1}s;
        left: ${i * 5}%;
        height: ${10 + Math.random() * 20}px;
      `;
      waveContainer.appendChild(wave);
    }
    header.appendChild(waveContainer);

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
    title.innerHTML = '🎵 Audio System';

    const masterControls = document.createElement('div');
    masterControls.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1;
      position: relative;
    `;

    const volumeControl = document.createElement('div');
    volumeControl.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.2);
      padding: 8px 12px;
      border-radius: 20px;
    `;

    volumeControl.innerHTML = `
      <span style="font-size: 0.9em;">🔊</span>
      <input type="range" id="master-volume" min="0" max="100" value="${this.audioSettings.masterVolume * 100}" style="
        width: 80px;
        height: 4px;
        border-radius: 2px;
        background: rgba(255,255,255,0.3);
        outline: none;
        -webkit-appearance: none;
      ">
    `;

    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.style.cssText = `
      padding: 8px 12px;
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s;
    `;
    muteBtn.innerHTML = '🔇 Mute';
    muteBtn.addEventListener('click', () => this.toggleMute());

    masterControls.appendChild(volumeControl);
    masterControls.appendChild(muteBtn);

    header.appendChild(title);
    header.appendChild(masterControls);
    panel.appendChild(header);

    // Audio tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--hermes-border);
    `;

    const tabs = [
      { id: 'background-music', label: '🎵 Background Music', icon: '🎵' },
      { id: 'sound-effects', label: '🔊 Sound Effects', icon: '🔊' },
      { id: 'audio-timeline', label: '⏱️ Timeline', icon: '⏱️' },
      { id: 'audio-settings', label: '⚙️ Settings', icon: '⚙️' }
    ];

    tabs.forEach((tab, index) => {
      const tabButton = document.createElement('button');
      tabButton.className = `audio-tab ${index === 0 ? 'active' : ''}`;
      tabButton.style.cssText = `
        padding: 12px 20px;
        border: none;
        background: ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        color: ${index === 0 ? 'var(--hermes-highlight-text)' : 'var(--hermes-text)'};
        cursor: pointer;
        border-bottom: 2px solid ${index === 0 ? 'var(--hermes-highlight-bg)' : 'transparent'};
        transition: all 0.2s;
        font-weight: bold;
      `;
      tabButton.textContent = tab.label;
      tabButton.addEventListener('click', () => this.switchAudioTab(tab.id));
      tabsContainer.appendChild(tabButton);
    });

    panel.appendChild(tabsContainer);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.id = 'audio-content-area';
    contentArea.style.cssText = 'min-height: 500px;';
    panel.appendChild(contentArea);

    // Initialize with background music
    this.switchAudioTab('background-music');

    // Bind master volume
    this.bindMasterVolumeEvents();
  },

  switchAudioTab(tabId) {
    // Update tab styles
    document.querySelectorAll('.audio-tab').forEach(tab => {
      tab.style.background = 'transparent';
      tab.style.color = 'var(--hermes-text)';
      tab.style.borderBottomColor = 'transparent';
    });

    const activeTab = document.querySelector(`.audio-tab:nth-child(${['background-music', 'sound-effects', 'audio-timeline', 'audio-settings'].indexOf(tabId) + 1})`);
    if (activeTab) {
      activeTab.style.background = 'var(--hermes-highlight-bg)';
      activeTab.style.color = 'var(--hermes-highlight-text)';
      activeTab.style.borderBottomColor = 'var(--hermes-highlight-bg)';
    }

    // Update content
    const contentArea = document.getElementById('audio-content-area');
    if (!contentArea) return;

    switch (tabId) {
      case 'background-music':
        contentArea.innerHTML = this.generateBackgroundMusicView();
        this.bindBackgroundMusicEvents();
        break;
      case 'sound-effects':
        contentArea.innerHTML = this.generateSoundEffectsView();
        this.bindSoundEffectsEvents();
        break;
      case 'audio-timeline':
        contentArea.innerHTML = this.generateAudioTimelineView();
        this.bindAudioTimelineEvents();
        break;
      case 'audio-settings':
        contentArea.innerHTML = this.generateAudioSettingsView();
        this.bindAudioSettingsEvents();
        break;
    }
  },

  generateBackgroundMusicView() {
    return `
      <div class="background-music-view">
        <!-- Music Player -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🎵 Music Player</h4>
          
          <div id="current-track-info" style="
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: var(--hermes-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 6px;
          ">
            <div style="
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5em;
              color: white;
            ">🎵</div>
            <div style="flex: 1;">
              <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px;">
                ${this.currentBackgroundMusic ? this.currentBackgroundMusic.title : 'No track selected'}
              </div>
              <div style="color: var(--hermes-disabled-text); font-size: 0.9em;">
                ${this.currentBackgroundMusic ? this.currentBackgroundMusic.artist || 'Unknown Artist' : 'Select a track to play'}
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="this.previousTrack()" style="
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                background: var(--hermes-info-text);
                color: white;
                cursor: pointer;
              ">⏮️</button>
              <button onclick="this.togglePlayPause()" style="
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                background: var(--hermes-success-text);
                color: white;
                cursor: pointer;
                font-weight: bold;
              ">${this.isPlaying ? '⏸️' : '▶️'}</button>
              <button onclick="this.nextTrack()" style="
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                background: var(--hermes-info-text);
                color: white;
                cursor: pointer;
              ">⏭️</button>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.8em; color: var(--hermes-disabled-text);">
              <span id="current-time">0:00</span>
              <span id="total-time">0:00</span>
            </div>
            <input type="range" id="progress-bar" min="0" max="100" value="0" style="
              width: 100%;
              height: 6px;
              border-radius: 3px;
              background: var(--hermes-border);
              outline: none;
              -webkit-appearance: none;
            ">
          </div>

          <!-- Volume Control -->
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: var(--hermes-text); font-weight: bold;">Music Volume:</span>
            <input type="range" id="music-volume" min="0" max="100" value="${this.audioSettings.musicVolume * 100}" style="
              flex: 1;
              height: 4px;
              border-radius: 2px;
              background: var(--hermes-border);
              outline: none;
              -webkit-appearance: none;
            ">
            <span id="music-volume-display" style="color: var(--hermes-text); font-weight: bold; min-width: 35px;">
              ${Math.round(this.audioSettings.musicVolume * 100)}%
            </span>
          </div>
        </div>

        <!-- Music Library -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--hermes-text);">🎼 Music Library</h4>
            <button onclick="this.addMusicTrack()" style="
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">➕ Add Music</button>
          </div>
          
          <div id="music-library" style="
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            max-height: 300px;
            overflow-y: auto;
          ">
            ${this.audioTracks.length === 0 ? `
              <div style="text-align: center; color: var(--hermes-disabled-text); font-style: italic; padding: 40px;">
                <div style="font-size: 3em; margin-bottom: 15px;">🎵</div>
                <div>No music tracks yet</div>
                <div style="font-size: 0.9em; margin-top: 5px;">Add music files to create atmosphere for your cards</div>
              </div>
            ` : this.generateMusicLibraryItems()}
          </div>
        </div>

        <!-- Preset Moods -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🌟 Preset Moods</h4>
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
          ">
            ${this.generateMoodPresets()}
          </div>
        </div>
      </div>
    `;
  },

  generateSoundEffectsView() {
    return `
      <div class="sound-effects-view">
        <!-- Sound Effects Library -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="margin: 0; color: var(--hermes-text);">🔊 Sound Effects</h4>
            <button onclick="this.addSoundEffect()" style="
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">➕ Add Sound</button>
          </div>
          
          <div style="margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="color: var(--hermes-text); font-weight: bold;">Effects Volume:</span>
              <input type="range" id="effects-volume" min="0" max="100" value="${this.audioSettings.effectsVolume * 100}" style="
                flex: 1;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
              <span id="effects-volume-display" style="color: var(--hermes-text); font-weight: bold; min-width: 35px;">
                ${Math.round(this.audioSettings.effectsVolume * 100)}%
              </span>
            </div>
          </div>
          
          <div id="sound-effects-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
          ">
            ${this.soundEffects.length === 0 ? `
              <div style="
                grid-column: 1 / -1;
                text-align: center;
                color: var(--hermes-disabled-text);
                font-style: italic;
                padding: 40px;
              ">
                <div style="font-size: 3em; margin-bottom: 15px;">🔊</div>
                <div>No sound effects yet</div>
                <div style="font-size: 0.9em; margin-top: 5px;">Add sound files for interactive elements</div>
              </div>
            ` : this.generateSoundEffectsItems()}
          </div>
        </div>

        <!-- Built-in Sound Effects -->
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 15px 0; color: var(--hermes-text);">🎯 Built-in Effects</h4>
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 8px;
          ">
            ${this.generateBuiltInEffects()}
          </div>
        </div>
      </div>
    `;
  },

  generateAudioTimelineView() {
    return `
      <div class="audio-timeline-view">
        <div style="text-align: center; padding: 60px 20px; color: var(--hermes-disabled-text);">
          <div style="font-size: 4em; margin-bottom: 20px;">⏱️</div>
          <h3 style="color: var(--hermes-text); margin-bottom: 10px;">Audio Timeline Coming Soon</h3>
          <p style="margin-bottom: 20px;">Sync audio with animations and card transitions.</p>
          <div style="
            background: var(--hermes-panel-bg);
            border: 1px solid var(--hermes-border);
            border-radius: 8px;
            padding: 20px;
            max-width: 400px;
            margin: 0 auto;
          ">
            <h4 style="color: var(--hermes-text); margin-bottom: 15px;">Planned Features</h4>
            <div style="text-align: left; color: var(--hermes-text);">
              • Audio keyframes and timing<br>
              • Sync with visual animations<br>
              • Crossfade between tracks<br>
              • Audio triggers for interactions<br>
              • Multi-track audio mixing
            </div>
          </div>
        </div>
      </div>
    `;
  },

  generateAudioSettingsView() {
    return `
      <div class="audio-settings-view">
        <div style="
          background: var(--hermes-panel-bg);
          border: 1px solid var(--hermes-border);
          border-radius: 8px;
          padding: 20px;
        ">
          <h4 style="margin: 0 0 20px 0; color: var(--hermes-text);">⚙️ Audio Settings</h4>
          
          <!-- Volume Settings -->
          <div style="margin-bottom: 25px;">
            <h5 style="color: var(--hermes-text); margin-bottom: 15px;">🔊 Volume Controls</h5>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Master Volume</label>
              <input type="range" id="settings-master-volume" min="0" max="100" value="${this.audioSettings.masterVolume * 100}" style="
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Music Volume</label>
              <input type="range" id="settings-music-volume" min="0" max="100" value="${this.audioSettings.musicVolume * 100}" style="
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">Effects Volume</label>
              <input type="range" id="settings-effects-volume" min="0" max="100" value="${this.audioSettings.effectsVolume * 100}" style="
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
          </div>

          <!-- Playback Settings -->
          <div style="margin-bottom: 25px;">
            <h5 style="color: var(--hermes-text); margin-bottom: 15px;">▶️ Playback Settings</h5>
            
            <div style="margin-bottom: 15px;">
              <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
                <input type="checkbox" id="auto-play" ${this.audioSettings.autoPlay ? 'checked' : ''}>
                <strong>Auto-play background music</strong>
              </label>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: flex; align-items: center; gap: 8px; color: var(--hermes-text);">
                <input type="checkbox" id="loop-music" ${this.audioSettings.loop ? 'checked' : ''}>
                <strong>Loop background music</strong>
              </label>
            </div>
          </div>

          <!-- Transition Settings -->
          <div style="margin-bottom: 25px;">
            <h5 style="color: var(--hermes-text); margin-bottom: 15px;">🎭 Transition Settings</h5>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">
                Fade In Duration: <span id="fade-in-value">${this.audioSettings.fadeInDuration / 1000}s</span>
              </label>
              <input type="range" id="fade-in-duration" min="0" max="10000" value="${this.audioSettings.fadeInDuration}" step="500" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">
                Fade Out Duration: <span id="fade-out-value">${this.audioSettings.fadeOutDuration / 1000}s</span>
              </label>
              <input type="range" id="fade-out-duration" min="0" max="10000" value="${this.audioSettings.fadeOutDuration}" step="500" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: var(--hermes-text); font-weight: bold;">
                Crossfade Duration: <span id="crossfade-value">${this.audioSettings.crossfadeDuration / 1000}s</span>
              </label>
              <input type="range" id="crossfade-duration" min="0" max="10000" value="${this.audioSettings.crossfadeDuration}" step="500" style="
                width: 100%;
                height: 4px;
                border-radius: 2px;
                background: var(--hermes-border);
                outline: none;
                -webkit-appearance: none;
              ">
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 10px;">
            <button onclick="this.resetAudioSettings()" style="
              padding: 10px 20px;
              border: 1px solid var(--hermes-border);
              border-radius: 6px;
              background: var(--hermes-button-bg);
              color: var(--hermes-text);
              cursor: pointer;
            ">Reset to Defaults</button>
            
            <button onclick="this.saveAudioSettings()" style="
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background: var(--hermes-success-text);
              color: white;
              cursor: pointer;
              font-weight: bold;
            ">Save Settings</button>
          </div>
        </div>
      </div>
    `;
  },

  generateMusicLibraryItems() {
    return this.audioTracks.map(track => `
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.selectTrack('${track.id}')" onmouseenter="this.style.borderColor='var(--hermes-highlight-bg)'" onmouseleave="this.style.borderColor='var(--hermes-border)'">
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2em;
        ">🎵</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: var(--hermes-text);">${track.title}</div>
          <div style="font-size: 0.8em; color: var(--hermes-disabled-text);">${track.artist || 'Unknown Artist'} • ${track.duration || '0:00'}</div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button onclick="event.stopPropagation(); this.playTrack('${track.id}')" style="
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-success-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">▶️</button>
          <button onclick="event.stopPropagation(); this.removeTrack('${track.id}')" style="
            padding: 4px 8px;
            border: none;
            border-radius: 4px;
            background: var(--hermes-error-text);
            color: white;
            cursor: pointer;
            font-size: 0.8em;
          ">🗑️</button>
        </div>
      </div>
    `).join('');
  },

  generateMoodPresets() {
    const moods = [
      { id: 'calm', name: 'Calm', icon: '🧘', color: '#4ecdc4' },
      { id: 'energetic', name: 'Energetic', icon: '⚡', color: '#ff6b6b' },
      { id: 'focus', name: 'Focus', icon: '🎯', color: '#45b7d1' },
      { id: 'creative', name: 'Creative', icon: '🎨', color: '#96ceb4' },
      { id: 'mysterious', name: 'Mysterious', icon: '🌙', color: '#5f27cd' },
      { id: 'upbeat', name: 'Upbeat', icon: '🎉', color: '#feca57' }
    ];

    return moods.map(mood => `
      <button onclick="this.applyMoodPreset('${mood.id}')" style="
        padding: 15px;
        border: none;
        border-radius: 8px;
        background: ${mood.color};
        color: white;
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      " onmouseenter="this.style.transform='scale(1.05)'" onmouseleave="this.style.transform='scale(1)'">
        <span style="font-size: 1.5em;">${mood.icon}</span>
        <span style="font-weight: bold; font-size: 0.9em;">${mood.name}</span>
      </button>
    `).join('');
  },

  generateSoundEffectsItems() {
    return this.soundEffects.map(effect => `
      <div style="
        background: var(--hermes-bg);
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      " onclick="this.playSoundEffect('${effect.id}')" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
        <div style="font-size: 1.5em; margin-bottom: 8px;">🔊</div>
        <div style="font-weight: bold; color: var(--hermes-text); margin-bottom: 4px; font-size: 0.9em;">
          ${effect.title}
        </div>
        <div style="font-size: 0.7em; color: var(--hermes-disabled-text); margin-bottom: 8px;">
          ${effect.duration || '0:00'}
        </div>
        <button onclick="event.stopPropagation(); this.removeSoundEffect('${effect.id}')" style="
          padding: 2px 6px;
          border: none;
          border-radius: 3px;
          background: var(--hermes-error-text);
          color: white;
          cursor: pointer;
          font-size: 0.7em;
        ">Remove</button>
      </div>
    `).join('');
  },

  generateBuiltInEffects() {
    const effects = [
      { id: 'click', name: 'Click', icon: '👆' },
      { id: 'pop', name: 'Pop', icon: '💥' },
      { id: 'whoosh', name: 'Whoosh', icon: '💨' },
      { id: 'ding', name: 'Ding', icon: '🔔' },
      { id: 'chime', name: 'Chime', icon: '🎐' },
      { id: 'beep', name: 'Beep', icon: '📟' },
      { id: 'buzz', name: 'Buzz', icon: '📳' },
      { id: 'ping', name: 'Ping', icon: '📍' }
    ];

    return effects.map(effect => `
      <button onclick="this.playBuiltInEffect('${effect.id}')" style="
        padding: 10px;
        border: 1px solid var(--hermes-border);
        border-radius: 6px;
        background: var(--hermes-button-bg);
        color: var(--hermes-text);
        cursor: pointer;
        text-align: center;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      " onmouseenter="this.style.background='var(--hermes-highlight-bg)'; this.style.color='var(--hermes-highlight-text)'" onmouseleave="this.style.background='var(--hermes-button-bg)'; this.style.color='var(--hermes-text)'">
        <span style="font-size: 1.2em;">${effect.icon}</span>
        <span style="font-size: 0.8em; font-weight: bold;">${effect.name}</span>
      </button>
    `).join('');
  },

  bindMasterVolumeEvents() {
    const masterVolume = document.getElementById('master-volume');
    if (masterVolume) {
      masterVolume.addEventListener('input', (e) => {
        this.audioSettings.masterVolume = e.target.value / 100;
        this.updateMasterVolume();
      });
    }
  },

  bindBackgroundMusicEvents() {
    // Music volume control
    const musicVolume = document.getElementById('music-volume');
    const musicVolumeDisplay = document.getElementById('music-volume-display');
    
    if (musicVolume && musicVolumeDisplay) {
      musicVolume.addEventListener('input', (e) => {
        this.audioSettings.musicVolume = e.target.value / 100;
        musicVolumeDisplay.textContent = e.target.value + '%';
        this.updateMusicVolume();
      });
    }
  },

  bindSoundEffectsEvents() {
    // Effects volume control
    const effectsVolume = document.getElementById('effects-volume');
    const effectsVolumeDisplay = document.getElementById('effects-volume-display');
    
    if (effectsVolume && effectsVolumeDisplay) {
      effectsVolume.addEventListener('input', (e) => {
        this.audioSettings.effectsVolume = e.target.value / 100;
        effectsVolumeDisplay.textContent = e.target.value + '%';
        this.updateEffectsVolume();
      });
    }
  },

  bindAudioTimelineEvents() {
    // Timeline events would be bound here
  },

  bindAudioSettingsEvents() {
    // Bind all settings controls
    const fadeInSlider = document.getElementById('fade-in-duration');
    const fadeOutSlider = document.getElementById('fade-out-duration');
    const crossfadeSlider = document.getElementById('crossfade-duration');
    
    if (fadeInSlider) {
      fadeInSlider.addEventListener('input', (e) => {
        document.getElementById('fade-in-value').textContent = (e.target.value / 1000) + 's';
        this.audioSettings.fadeInDuration = parseInt(e.target.value);
      });
    }
    
    if (fadeOutSlider) {
      fadeOutSlider.addEventListener('input', (e) => {
        document.getElementById('fade-out-value').textContent = (e.target.value / 1000) + 's';
        this.audioSettings.fadeOutDuration = parseInt(e.target.value);
      });
    }
    
    if (crossfadeSlider) {
      crossfadeSlider.addEventListener('input', (e) => {
        document.getElementById('crossfade-value').textContent = (e.target.value / 1000) + 's';
        this.audioSettings.crossfadeDuration = parseInt(e.target.value);
      });
    }
  },

  toggleMute() {
    // Toggle mute functionality
    const muteBtn = document.getElementById('mute-btn');
    if (this.audioSettings.masterVolume > 0) {
      this.previousVolume = this.audioSettings.masterVolume;
      this.audioSettings.masterVolume = 0;
      if (muteBtn) muteBtn.innerHTML = '🔊 Unmute';
    } else {
      this.audioSettings.masterVolume = this.previousVolume || 0.7;
      if (muteBtn) muteBtn.innerHTML = '🔇 Mute';
    }
    this.updateMasterVolume();
  },

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    // Implementation would control actual audio playback
    console.log(this.isPlaying ? 'Playing' : 'Paused');
  },

  addMusicTrack() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const track = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Unknown Artist',
          duration: '0:00',
          file: file,
          addedAt: new Date().toISOString()
        };
        
        this.audioTracks.push(track);
      });
      
      this.saveAudioTracks();
      this.switchAudioTab('background-music'); // Refresh view
    };
    
    input.click();
  },

  addSoundEffect() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    
    input.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        const effect = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: '0:00',
          file: file,
          addedAt: new Date().toISOString()
        };
        
        this.soundEffects.push(effect);
      });
      
      this.saveSoundEffects();
      this.switchAudioTab('sound-effects'); // Refresh view
    };
    
    input.click();
  },

  playBuiltInEffect(effectId) {
    // Play built-in sound effect
    console.log(`Playing built-in effect: ${effectId}`);
    // Implementation would play actual audio
  },

  applyMoodPreset(moodId) {
    console.log(`Applying mood preset: ${moodId}`);
    // Implementation would apply mood-specific audio settings
  },

  saveAudioSettings() {
    this.saveSettings();
    alert('Audio settings saved!');
  },

  resetAudioSettings() {
    if (confirm('Reset all audio settings to defaults?')) {
      this.audioSettings = this.getDefaultSettings();
      this.saveSettings();
      this.switchAudioTab('audio-settings'); // Refresh view
    }
  },

  updateMasterVolume() {
    // Update master volume for all audio
  },

  updateMusicVolume() {
    // Update background music volume
  },

  updateEffectsVolume() {
    // Update sound effects volume
  },

  saveAudioTracks() {
    localStorage.setItem('nextnote_audio_tracks', JSON.stringify(this.audioTracks));
  },

  saveSoundEffects() {
    localStorage.setItem('nextnote_sound_effects', JSON.stringify(this.soundEffects));
  },

  saveSettings() {
    localStorage.setItem('nextnote_audio_settings', JSON.stringify(this.audioSettings));
  },

  initializeAudioComponents(app) {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes audioWave {
        0% { height: 10px; }
        100% { height: 25px; }
      }
      
      #master-volume::-webkit-slider-thumb,
      #music-volume::-webkit-slider-thumb,
      #effects-volume::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #ff6b6b;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);
  },

  bindAudioEvents(app) {
    // Listen for audio events
    app.on('audioUpdated', () => {
      this.saveSettings();
    });
  }
});
