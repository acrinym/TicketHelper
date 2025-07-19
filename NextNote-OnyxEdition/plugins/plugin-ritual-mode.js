// plugins/plugin-ritual-mode.js

window.registerNextNotePlugin({
  name: "RitualMode",
  onLoad: function(app) {
    // Ritual Mode specific styling
    const ritualStyle = document.createElement("style");
    ritualStyle.textContent = `
      .ritual-mode {
        --ritual-primary: #7c3aed;
        --ritual-secondary: #5b21b6;
        --ritual-accent: #f59e0b;
        --ritual-success: #059669;
        --ritual-warning: #dc2626;
        --ritual-light: #faf5ff;
        --ritual-dark: #1e1b4b;
        --ritual-mystic: #8b5cf6;
      }
      
      .ritual-mode-panel {
        background: linear-gradient(135deg, var(--ritual-light) 0%, #e9d5ff 100%);
        border: 2px solid var(--ritual-primary);
        border-radius: 12px;
        padding: 20px;
        margin: 15px 0;
        max-height: 500px;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.15);
      }
      
      .ritual-category {
        margin-bottom: 25px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        padding: 15px;
        border-left: 4px solid var(--ritual-primary);
      }
      
      .ritual-category h3 {
        color: var(--ritual-primary);
        border-bottom: 1px solid var(--ritual-mystic);
        padding-bottom: 8px;
        margin-bottom: 15px;
        font-size: 18px;
        font-weight: bold;
      }
      
      .ritual-template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 15px;
      }
      
      .ritual-template-item {
        border: 1px solid var(--ritual-mystic);
        border-radius: 10px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s;
        background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
        position: relative;
        overflow: hidden;
      }
      
      .ritual-template-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--ritual-primary), var(--ritual-accent));
      }
      
      .ritual-template-item:hover {
        border-color: var(--ritual-primary);
        background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%);
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.2);
      }
      
      .ritual-template-icon {
        font-size: 28px;
        margin-bottom: 8px;
        text-align: center;
      }
      
      .ritual-template-name {
        font-weight: 600;
        margin-bottom: 5px;
        color: var(--ritual-dark);
        text-align: center;
        font-size: 14px;
      }
      
      .ritual-template-desc {
        font-size: 12px;
        color: #6b7280;
        text-align: center;
        line-height: 1.4;
      }
      
      .ritual-mode-toggle {
        position: fixed;
        top: 320px;
        right: 20px;
        z-index: 1000;
        background: linear-gradient(135deg, var(--ritual-primary), var(--ritual-secondary));
        color: white;
        border: none;
        padding: 12px 18px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        transition: all 0.3s;
      }
      
      .ritual-mode-toggle:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
      }
      
      .sigil-canvas {
        border: 2px solid var(--ritual-mystic);
        border-radius: 8px;
        background: white;
        cursor: crosshair;
      }
      
      .ritual-tools {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
        flex-wrap: wrap;
      }
      
      .ritual-tool-btn {
        background: var(--ritual-primary);
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }
      
      .ritual-tool-btn:hover {
        background: var(--ritual-secondary);
        transform: translateY(-1px);
      }
      
      .ritual-tool-btn.active {
        background: var(--ritual-accent);
      }
    `;
    document.head.appendChild(ritualStyle);

    // Comprehensive Ritual Mode Templates
    const ritualTemplates = {
      '🧙‍♂️ Magical Journaling': {
        'Daily Ritual Log': {
          icon: '📖',
          description: 'Daily magical practice tracking and reflection',
          template: createDailyRitualTemplate()
        },
        'Moon Phase Journal': {
          icon: '🌙',
          description: 'Lunar cycle tracking and intention setting',
          template: createMoonPhaseTemplate()
        },
        'Seasonal Celebrations': {
          icon: '🍂',
          description: 'Wheel of the year and seasonal rituals',
          template: createSeasonalTemplate()
        },
        'Dream Journal': {
          icon: '💭',
          description: 'Dream recording and interpretation',
          template: createDreamJournalTemplate()
        },
        'Meditation Practice': {
          icon: '🧘',
          description: 'Meditation sessions and insights',
          template: createMeditationTemplate()
        },
        'Energy Work Log': {
          icon: '⚡',
          description: 'Chakra work and energy healing',
          template: createEnergyWorkTemplate()
        }
      },
      '🔮 Sigil Crafting': {
        'Sigil Generator': {
          icon: '✡️',
          description: 'Create and store personal sigils',
          template: createSigilGeneratorTemplate()
        },
        'Sigil Library': {
          icon: '📚',
          description: 'Collection of created sigils',
          template: createSigilLibraryTemplate()
        },
        'Sigil Activation': {
          icon: '🔥',
          description: 'Sigil charging and activation rituals',
          template: createSigilActivationTemplate()
        },
        'Sigil Results': {
          icon: '📊',
          description: 'Track sigil effectiveness and outcomes',
          template: createSigilResultsTemplate()
        }
      },
      '🌌 Spell Crafting': {
        'Spell Formulation': {
          icon: '✨',
          description: 'Create and document spells',
          template: createSpellFormulationTemplate()
        },
        'Spell Components': {
          icon: '🌿',
          description: 'Herbs, crystals, and magical ingredients',
          template: createSpellComponentsTemplate()
        },
        'Spell Timing': {
          icon: '⏰',
          description: 'Astrological timing and correspondences',
          template: createSpellTimingTemplate()
        },
        'Spell Results': {
          icon: '📈',
          description: 'Track spell effectiveness and outcomes',
          template: createSpellResultsTemplate()
        }
      },
      '📖 Flame Vow Archive': {
        'Vow Creation': {
          icon: '🔥',
          description: 'Create and document sacred vows',
          template: createVowCreationTemplate()
        },
        'Vow Tracking': {
          icon: '📋',
          description: 'Track vow progress and completion',
          template: createVowTrackingTemplate()
        },
        'Vow Reflection': {
          icon: '🤔',
          description: 'Reflect on vow impact and growth',
          template: createVowReflectionTemplate()
        },
        'Vow Completion': {
          icon: '✅',
          description: 'Celebrate completed vows and achievements',
          template: createVowCompletionTemplate()
        }
      },
      '🧭 Threshold Tracking': {
        'AmandaMap Style': {
          icon: '🗺️',
          description: 'Personal growth and transformation mapping',
          template: createAmandaMapTemplate()
        },
        'Liminal Spaces': {
          icon: '🚪',
          description: 'Track transitions and threshold moments',
          template: createLiminalSpacesTemplate()
        },
        'Integration Periods': {
          icon: '🔄',
          description: 'Document integration of insights and changes',
          template: createIntegrationTemplate()
        },
        'Transformation Timeline': {
          icon: '📅',
          description: 'Personal evolution and growth timeline',
          template: createTransformationTemplate()
        }
      },
      '🔮 Divination': {
        'Tarot Readings': {
          icon: '🎴',
          description: 'Tarot card readings and interpretations',
          template: createTarotTemplate()
        },
        'Astrology Charts': {
          icon: '⭐',
          description: 'Birth charts and astrological insights',
          template: createAstrologyTemplate()
        },
        'Rune Castings': {
          icon: 'ᚠ',
          description: 'Rune readings and interpretations',
          template: createRuneTemplate()
        },
        'Oracle Readings': {
          icon: '🔮',
          description: 'Oracle card readings and guidance',
          template: createOracleTemplate()
        }
      }
    };

    // Create Ritual Mode toggle button
    const ritualToggle = document.createElement('button');
    ritualToggle.className = 'ritual-mode-toggle';
    ritualToggle.textContent = '🧙‍♂️ Ritual Mode';
    ritualToggle.onclick = toggleRitualMode;
    document.body.appendChild(ritualToggle);

    function toggleRitualMode() {
      const existing = document.querySelector('.ritual-mode-panel');
      if (existing) {
        existing.remove();
        return;
      }
      
      showRitualMode();
    }

    function showRitualMode() {
      const panel = document.createElement('div');
      panel.className = 'ritual-mode-panel';
      
      let html = '<h2 style="margin-top: 0; color: var(--ritual-primary); text-align: center;">🧙‍♂️ Ritual Mode - Sacred Digital Temple</h2>';
      html += '<p style="margin-bottom: 20px; color: #6b7280; text-align: center; font-style: italic;">Merge the sacred and the structured. Your digital temple awaits.</p>';
      
      Object.keys(ritualTemplates).forEach(category => {
        html += `
          <div class="ritual-category">
            <h3>${category}</h3>
            <div class="ritual-template-grid">
        `;
        
        Object.keys(ritualTemplates[category]).forEach(templateName => {
          const template = ritualTemplates[category][templateName];
          html += `
            <div class="ritual-template-item" onclick="createRitualTemplate('${category}', '${templateName}')">
              <div class="ritual-template-icon">${template.icon}</div>
              <div class="ritual-template-name">${templateName}</div>
              <div class="ritual-template-desc">${template.description}</div>
            </div>
          `;
        });
        
        html += '</div></div>';
      });
      
      panel.innerHTML = html;
      
      // Insert after toolbar
      const toolbar = document.getElementById('toolbar');
      toolbar.parentNode.insertBefore(panel, toolbar.nextSibling);
    }

    function createRitualTemplate(category, templateName) {
      const template = ritualTemplates[category][templateName];
      if (!template || !template.template) return;
      
      if (currentSection) {
        const newPage = {
          id: crypto.randomUUID(),
          title: templateName,
          content: template.template,
          tags: ['ritual', 'sacred', category.toLowerCase(), templateName.toLowerCase()],
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        };
        
        currentSection.pages.push(newPage);
        saveData();
        renderSections();
        selectPage(currentSection.id, newPage.id);
        
        alert(`✨ ${templateName} created! Your sacred digital temple grows.`);
      }
    }

    // Template creation functions
    function createDailyRitualTemplate() {
      return `# 📖 Daily Ritual Log

## 🌅 Morning Ritual
**Date**: ${new Date().toLocaleDateString()}
**Moon Phase**: [Current moon phase]
**Sun Sign**: [Current zodiac sign]

### 🧘 Morning Practice
- **Meditation Duration**: [Minutes]
- **Focus**: [What you focused on]
- **Insights**: [Any insights or revelations]

### 🔮 Daily Intention
**Primary Intention**: [Your main intention for the day]
**Supporting Intentions**: 
- [Secondary intention 1]
- [Secondary intention 2]

### 🌿 Morning Offerings
- **Crystals**: [Crystals used]
- **Herbs**: [Herbs or incense]
- **Prayers**: [Prayers or affirmations]

## 🌙 Evening Ritual

### 📝 Daily Reflection
**Gratitude**: 
- [What you're grateful for today]
- [What went well]
- [What you learned]

**Challenges**: 
- [What was difficult]
- [How you handled it]
- [What you could improve]

### 🔥 Evening Practice
- **Cleansing**: [How you cleansed your energy]
- **Protection**: [Protection rituals performed]
- **Dream Intention**: [Intention for tonight's dreams]

### 📊 Energy Tracking
**Overall Energy Level**: [1-10]
**Chakra Balance**: [Notes on chakra state]
**Aura State**: [Aura observations]

## 🎯 Weekly Themes
**This Week's Focus**: [Weekly theme or goal]
**Progress**: [How you're progressing]
**Adjustments**: [Any adjustments needed]

---
*"Every day is a new opportunity to align with your highest self."* ✨`;
    }

    function createSigilGeneratorTemplate() {
      return `# ✡️ Sigil Generator

## 🎨 Sigil Creation
**Date Created**: ${new Date().toLocaleDateString()}
**Intention**: [Your intention for this sigil]

### 📝 Intention Breakdown
**Core Desire**: [What you truly want]
**Emotional State**: [How you want to feel]
**Outcome**: [Specific outcome you seek]

### 🔤 Letter Method
**Original Phrase**: [Your intention phrase]
**Letters Used**: [Letters from your phrase]
**Sigil Shape**: [Description of the sigil design]

### 🎨 Design Elements
**Style**: [Geometric, organic, abstract, etc.]
**Symmetry**: [Symmetrical, asymmetrical, etc.]
**Complexity**: [Simple, moderate, complex]

### 🔥 Activation Method
**Charging Method**: [How you'll charge the sigil]
**Activation Date**: [When you'll activate it]
**Ritual**: [Specific activation ritual]

## 📊 Sigil Tracking
**Creation Date**: [Date]
**Activation Date**: [Date]
**Results Observed**: [What you've noticed]
**Effectiveness**: [1-10 scale]

### 📝 Notes
[Any additional notes about the sigil]

---
*"Symbols are the language of the subconscious mind."* 🔮`;
    }

    function createSpellFormulationTemplate() {
      return `# ✨ Spell Formulation

## 🎯 Spell Intent
**Spell Name**: [Name your spell]
**Primary Goal**: [Main objective]
**Secondary Goals**: [Additional outcomes]
**Timeline**: [How long to manifest]

### 🔮 Spell Components

#### 🌿 Herbs & Plants
- **Primary**: [Main herb]
- **Supporting**: [Supporting herbs]
- **Correspondences**: [Planetary/elemental associations]

#### 💎 Crystals & Stones
- **Primary**: [Main crystal]
- **Supporting**: [Supporting crystals]
- **Placement**: [How to use them]

#### 🕯️ Candles & Fire
- **Color**: [Candle color]
- **Number**: [How many candles]
- **Purpose**: [What each represents]

#### 🌊 Water & Liquids
- **Type**: [Spring water, moon water, etc.]
- **Use**: [How to incorporate]
- **Blessing**: [How to bless it]

### ⏰ Timing & Astrology
**Moon Phase**: [Waxing, waning, full, new]
**Day of Week**: [Best day for this spell]
**Planetary Hour**: [Optimal planetary hour]
**Astrological Sign**: [Relevant zodiac sign]

### 🎭 Ritual Structure
**Preparation**: [How to prepare]
**Opening**: [How to open the ritual]
**Main Working**: [Core spell work]
**Closing**: [How to close]
**Cleanup**: [Post-ritual cleanup]

### 📊 Results Tracking
**Cast Date**: [When you cast it]
**Expected Timeline**: [When to expect results]
**Signs & Omens**: [What to watch for]
**Results**: [What actually happened]

---
*"Magic is the art of changing consciousness at will."* 🌟`;
    }

    function createAmandaMapTemplate() {
      return `# 🗺️ AmandaMap Style - Personal Growth Mapping

## 🧭 Current Threshold
**Date**: ${new Date().toLocaleDateString()}
**Current Phase**: [Where you are in your journey]
**Threshold Type**: [Death/Rebirth, Initiation, Integration, etc.]

### 🎯 What's Dying
**Old Patterns**: [What's falling away]
**Beliefs**: [What you're letting go of]
**Identities**: [What you're shedding]
**Relationships**: [What's ending or changing]

### 🌱 What's Being Born
**New Patterns**: [What's emerging]
**Beliefs**: [What you're embracing]
**Identities**: [Who you're becoming]
**Relationships**: [What's beginning]

### 🚪 Liminal Space
**Duration**: [How long you've been here]
**Sensations**: [What it feels like]
**Challenges**: [What's difficult]
**Gifts**: [What you're learning]

## 📍 Integration Points

### 🔄 Past Integration
**Previous Threshold**: [Last major transition]
**Lessons Learned**: [What you integrated]
**Current Application**: [How it serves you now]

### 🎯 Current Integration
**Daily Practices**: [What helps you integrate]
**Support Systems**: [Who/what supports you]
**Integration Challenges**: [What's hard to integrate]

### 🔮 Future Integration
**Next Threshold**: [What's coming]
**Preparation**: [How you're preparing]
**Intentions**: [What you want to integrate]

## 🎨 Visual Mapping
**Current State**: [Draw or describe your current state]
**Desired State**: [Draw or describe where you're going]
**Path**: [Draw or describe the path between]

### 🎭 Archetypes Present
**Shadow**: [What shadow aspects are active]
**Hero**: [What heroic qualities are emerging]
**Wise One**: [What wisdom is available]
**Trickster**: [What's challenging your assumptions]

---
*"The map is not the territory, but it helps you navigate."* 🧭`;
    }

    // Add more template functions for other categories...
    function createMoonPhaseTemplate() {
      return `# 🌙 Moon Phase Journal

## 🌑 Current Moon Phase
**Date**: ${new Date().toLocaleDateString()}
**Moon Phase**: [New, Waxing Crescent, First Quarter, Waxing Gibbous, Full, Waning Gibbous, Last Quarter, Waning Crescent]
**Moon Sign**: [Current zodiac sign]
**Moon Age**: [Days since new moon]

### 🎯 Phase Intentions
**New Moon**: [New beginnings, intentions]
**Waxing Moon**: [Growth, building, action]
**Full Moon**: [Manifestation, completion, release]
**Waning Moon**: [Release, letting go, rest]

### 🌿 Corresponding Practices
**Crystals**: [Moon phase appropriate crystals]
**Herbs**: [Moon phase appropriate herbs]
**Rituals**: [Moon phase specific rituals]
**Spells**: [Moon phase appropriate spells]

---
*"The moon is a loyal companion. It never leaves. It's always there, watching, steadfast, knowing us in our light and dark moments."* 🌙`;
    }

    // Make functions globally available
    window.toggleRitualMode = toggleRitualMode;
    window.showRitualMode = showRitualMode;
    window.createRitualTemplate = createRitualTemplate;
  }
}); 