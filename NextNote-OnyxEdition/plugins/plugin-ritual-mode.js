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
        'Personal Growth Mapping': {
          icon: '🗺️',
          description: 'Personal growth and transformation mapping',
          template: createPersonalGrowthTemplate()
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

    function createPersonalGrowthTemplate() {
      return `# 🗺️ Personal Growth Mapping

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

    function createSeasonalTemplate() {
      return `# 🍂 Seasonal Celebrations

## 🌸 Spring Equinox (Ostara)
**Date**: March 20-21
**Theme**: New beginnings, fertility, growth
**Activities**: 
- [Spring cleaning rituals]
- [Planting seeds]
- [Egg decorating]
- [Nature walks]

## ☀️ Summer Solstice (Litha)
**Date**: June 20-21
**Theme**: Peak energy, abundance, celebration
**Activities**:
- [Bonfire celebrations]
- [Herb gathering]
- [Sun rituals]
- [Outdoor feasts]

## 🍁 Autumn Equinox (Mabon)
**Date**: September 22-23
**Theme**: Harvest, gratitude, balance
**Activities**:
- [Harvest celebrations]
- [Gratitude rituals]
- [Apple picking]
- [Thanksgiving feasts]

## ❄️ Winter Solstice (Yule)
**Date**: December 21-22
**Theme**: Rebirth, hope, light returning
**Activities**:
- [Yule log burning]
- [Evergreen decorations]
- [Candle lighting]
- [Family gatherings]

---
*"The wheel turns, and we turn with it."* 🌿`;
    }

    function createDreamJournalTemplate() {
      return `# 💭 Dream Journal

## 🌙 Dream Entry
**Date**: ${new Date().toLocaleDateString()}
**Time**: [When you went to sleep/woke up]
**Moon Phase**: [Current moon phase]
**Dream Type**: [Lucid, Regular, Nightmare, etc.]

### 📝 Dream Content
**Setting**: [Where the dream took place]
**Characters**: [Who was in the dream]
**Plot**: [What happened in the dream]
**Emotions**: [How you felt during the dream]

### 🔍 Dream Analysis
**Symbols**: [Recurring symbols or themes]
**Personal Meaning**: [What this dream means to you]
**Archetypes**: [Jungian archetypes present]
**Messages**: [What the dream is trying to tell you]

### 📊 Dream Patterns
**Recurring Themes**: [Themes that appear often]
**Emotional Patterns**: [Emotional states in dreams]
**Color Themes**: [Colors that appear frequently]
**Location Patterns**: [Places that appear often]

---
*"Dreams are the royal road to the unconscious."* - Carl Jung 💫`;
    }

    function createMeditationTemplate() {
      return `# 🧘 Meditation Practice

## 🎯 Session Details
**Date**: ${new Date().toLocaleDateString()}
**Time**: [Start time - End time]
**Duration**: [Minutes]
**Type**: [Mindfulness, Loving-kindness, Vipassana, etc.]

### 🧠 Pre-Meditation State
**Energy Level**: [1-10]
**Mental State**: [Calm, Anxious, Distracted, etc.]
**Physical Comfort**: [Comfortable, Uncomfortable, etc.]
**Intentions**: [What you hope to achieve]

### 🌊 During Meditation
**Focus Object**: [Breath, Mantra, Visualization, etc.]
**Distractions**: [What distracted you]
**Breakthroughs**: [Any insights or realizations]
**Challenges**: [What was difficult]

### 📈 Post-Meditation
**Energy Level**: [1-10]
**Mental Clarity**: [1-10]
**Emotional State**: [How you feel]
**Insights**: [Any insights gained]

### 📊 Progress Tracking
**Consistency**: [Days this week/month]
**Improvements**: [What's getting better]
**Challenges**: [What's still difficult]
**Goals**: [What you want to improve]

---
*"Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts and our feelings."* 🧘‍♀️`;
    }

    function createEnergyWorkTemplate() {
      return `# ⚡ Energy Work Log

## 🔮 Session Overview
**Date**: ${new Date().toLocaleDateString()}
**Time**: [Start time - End time]
**Type**: [Reiki, Chakra work, Aura cleansing, etc.]
**Practitioner**: [Self or practitioner name]

### 🎯 Focus Areas
**Primary Focus**: [Main area of work]
**Secondary Focus**: [Additional areas]
**Intention**: [What you want to achieve]
**Outcome**: [What actually happened]

### 🌈 Chakra Work
**Root Chakra**: [State and notes]
**Sacral Chakra**: [State and notes]
**Solar Plexus**: [State and notes]
**Heart Chakra**: [State and notes]
**Throat Chakra**: [State and notes]
**Third Eye**: [State and notes]
**Crown Chakra**: [State and notes]

### ✨ Energy Sensations
**Physical**: [What you felt in your body]
**Emotional**: [What emotions came up]
**Mental**: [What thoughts appeared]
**Spiritual**: [What spiritual insights]

### 📊 Results
**Immediate Effects**: [What happened right away]
**Long-term Effects**: [What continued to happen]
**Integration**: [How you integrated the work]
**Follow-up**: [What you need to do next]

---
*"Energy flows where attention goes."* ⚡`;
    }

    function createSigilLibraryTemplate() {
      return `# 📚 Sigil Library

## ✨ Sigil Collection
**Total Sigils**: [Number of sigils created]
**Active Sigils**: [Number currently active]
**Completed Sigils**: [Number that have manifested]

### 📋 Sigil Index
**1. [Sigil Name]**
- **Created**: [Date]
- **Intention**: [Brief description]
- **Status**: [Active/Completed/Archived]
- **Results**: [What happened]

**2. [Sigil Name]**
- **Created**: [Date]
- **Intention**: [Brief description]
- **Status**: [Active/Completed/Archived]
- **Results**: [What happened]

### 🎯 Categories
**Protection**: [Number of protection sigils]
**Manifestation**: [Number of manifestation sigils]
**Healing**: [Number of healing sigils]
**Transformation**: [Number of transformation sigils]

### 📊 Effectiveness Tracking
**Success Rate**: [Percentage of successful sigils]
**Average Time**: [Average time to manifestation]
**Best Categories**: [Which types work best]
**Areas for Improvement**: [What needs work]

---
*"Your sigil library is your magical toolkit."* 📚`;
    }

    function createSigilActivationTemplate() {
      return `# 🔥 Sigil Activation

## ✨ Sigil Details
**Sigil Name**: [Name of the sigil]
**Created Date**: [When it was created]
**Intention**: [Original intention]
**Activation Date**: ${new Date().toLocaleDateString()}

### 🎯 Activation Method
**Method**: [Fire, Water, Earth, Air, etc.]
**Materials**: [What you used]
**Location**: [Where you activated it]
**Time**: [When you activated it]

### 🔮 Activation Ritual
**Preparation**: [How you prepared]
**Opening**: [How you opened the ritual]
**Activation**: [How you activated the sigil]
**Closing**: [How you closed the ritual]

### 📊 Activation Results
**Immediate Effects**: [What happened right away]
**Energy Sensations**: [What you felt]
**Signs & Omens**: [What you noticed]
**Confirmation**: [How you know it worked]

### 📝 Notes
[Any additional notes about the activation]

---
*"Activation is the moment when intention becomes reality."* 🔥`;
    }

    function createSigilResultsTemplate() {
      return `# 📊 Sigil Results

## ✨ Sigil Information
**Sigil Name**: [Name of the sigil]
**Created Date**: [When it was created]
**Activated Date**: [When it was activated]
**Intention**: [Original intention]

### 📈 Results Tracking
**Date**: ${new Date().toLocaleDateString()}
**Time Since Activation**: [Days/weeks/months]
**Current Status**: [In Progress/Manifesting/Complete]

### 🎯 Manifestation Progress
**Signs of Manifestation**: [What you've noticed]
**Partial Results**: [What has partially manifested]
**Full Results**: [What has fully manifested]
**Unexpected Results**: [What you didn't expect]

### 📊 Effectiveness Analysis
**Effectiveness Rating**: [1-10 scale]
**Speed of Manifestation**: [Fast/Medium/Slow]
**Quality of Results**: [Better than expected/As expected/Less than expected]
**Side Effects**: [Any unexpected effects]

### 🔮 Lessons Learned
**What Worked**: [What helped the manifestation]
**What Didn't Work**: [What hindered the manifestation]
**Improvements**: [What you'd do differently]
**Future Applications**: [How to apply these lessons]

---
*"Results are the feedback loop of magical practice."* 📊`;
    }

    function createSpellComponentsTemplate() {
      return `# 🌿 Spell Components

## 🎯 Spell Information
**Spell Name**: [Name of the spell]
**Type**: [Type of spell]
**Date Created**: ${new Date().toLocaleDateString()}

### 🌿 Herbs & Plants
**Primary Herbs**:
- [Herb 1]: [Correspondence and use]
- [Herb 2]: [Correspondence and use]
- [Herb 3]: [Correspondence and use]

**Supporting Herbs**:
- [Herb 1]: [Correspondence and use]
- [Herb 2]: [Correspondence and use]

### 💎 Crystals & Stones
**Primary Crystals**:
- [Crystal 1]: [Properties and placement]
- [Crystal 2]: [Properties and placement]

**Supporting Stones**:
- [Stone 1]: [Properties and placement]

### 🕯️ Candles & Fire
**Candle Colors**:
- [Color 1]: [Meaning and purpose]
- [Color 2]: [Meaning and purpose]

**Number of Candles**: [How many and why]

### 🌊 Water & Liquids
**Types of Water**:
- [Water type 1]: [Source and use]
- [Water type 2]: [Source and use]

**Other Liquids**:
- [Liquid 1]: [Use and purpose]

### 📝 Notes
[Additional notes about components]

---
*"The right components amplify your intention."* 🌿`;
    }

    function createSpellTimingTemplate() {
      return `# ⏰ Spell Timing

## 🎯 Spell Information
**Spell Name**: [Name of the spell]
**Type**: [Type of spell]
**Date Created**: ${new Date().toLocaleDateString()}

### 🌙 Moon Phase Timing
**Optimal Moon Phase**: [New/Waxing/Full/Waning]
**Moon Sign**: [Best zodiac sign for this spell]
**Moon Age**: [Optimal days since new moon]

### ⭐ Astrological Timing
**Planetary Hour**: [Best planetary hour]
**Day of Week**: [Best day for this spell]
**Zodiac Sign**: [Best sign for this spell]
**Planetary Aspects**: [Important planetary aspects]

### 🕐 Time of Day
**Best Time**: [Morning/Afternoon/Evening/Night]
**Specific Time**: [Exact time if applicable]
**Duration**: [How long the spell should take]

### 📅 Seasonal Timing
**Best Season**: [Spring/Summer/Fall/Winter]
**Specific Date**: [If there's a specific date]
**Holiday Alignment**: [If it aligns with a holiday]

### 🔮 Timing Considerations
**Personal Timing**: [Your personal energy cycles]
**External Factors**: [Weather, events, etc.]
**Preparation Time**: [Time needed to prepare]

---
*"Timing is everything in magical practice."* ⏰`;
    }

    function createSpellResultsTemplate() {
      return `# 📈 Spell Results

## 🎯 Spell Information
**Spell Name**: [Name of the spell]
**Cast Date**: [When you cast it]
**Type**: [Type of spell]
**Intention**: [What you intended]

### 📊 Results Tracking
**Date**: ${new Date().toLocaleDateString()}
**Time Since Casting**: [Days/weeks/months]
**Current Status**: [In Progress/Manifesting/Complete]

### 🎯 Manifestation Progress
**Immediate Effects**: [What happened right away]
**Short-term Results**: [What happened in the first week]
**Medium-term Results**: [What happened in the first month]
**Long-term Results**: [What's still happening]

### 📈 Effectiveness Analysis
**Effectiveness Rating**: [1-10 scale]
**Speed of Manifestation**: [Fast/Medium/Slow]
**Quality of Results**: [Better than expected/As expected/Less than expected]
**Unexpected Results**: [What you didn't expect]

### 🔮 Lessons Learned
**What Worked**: [What helped the spell work]
**What Didn't Work**: [What hindered the spell]
**Improvements**: [What you'd do differently]
**Future Applications**: [How to apply these lessons]

---
*"Results guide the evolution of your practice."* 📈`;
    }

    function createVowCreationTemplate() {
      return `# 🔥 Vow Creation

## 🎯 Vow Information
**Vow Name**: [Name of the vow]
**Date Created**: ${new Date().toLocaleDateString()}
**Type**: [Type of vow - personal, spiritual, etc.]

### 🔮 Vow Intent
**Primary Intention**: [Main purpose of the vow]
**Secondary Goals**: [Additional outcomes]
**Timeline**: [How long the vow will last]
**Scope**: [What the vow covers]

### 📝 Vow Statement
**Formal Statement**: [The actual vow words]
**Personal Meaning**: [What it means to you]
**Spiritual Significance**: [Why it matters spiritually]
**Practical Application**: [How to live it daily]

### 🎯 Commitment Level
**Duration**: [How long you're committing]
**Intensity**: [How deeply you're committing]
**Flexibility**: [How flexible the vow is]
**Accountability**: [How you'll hold yourself accountable]

### 📊 Success Metrics
**How You'll Measure Success**: [Specific metrics]
**Milestones**: [Key points along the way]
**Celebration Points**: [When to celebrate progress]
**Completion Criteria**: [What constitutes completion]

---
*"A vow is a promise to your highest self."* 🔥`;
    }

    function createVowTrackingTemplate() {
      return `# 📋 Vow Tracking

## 🔥 Vow Information
**Vow Name**: [Name of the vow]
**Start Date**: [When you began]
**Duration**: [How long it's supposed to last]
**Current Status**: [Active/Completed/Broken]

### 📊 Progress Tracking
**Date**: ${new Date().toLocaleDateString()}
**Days Since Start**: [Number of days]
**Progress Percentage**: [How far along you are]

### ✅ Daily/Weekly Check-ins
**Date**: [Date of check-in]
**Did I honor my vow today?**: [Yes/No/Partially]
**Challenges faced**: [What was difficult]
**Successes**: [What went well]
**Adjustments needed**: [What needs to change]

### 📈 Milestone Tracking
**Milestone 1**: [Description and date achieved]
**Milestone 2**: [Description and date achieved]
**Milestone 3**: [Description and date achieved]

### 🔮 Reflection
**How has this vow changed me?**: [Personal growth]
**What am I learning?**: [Insights gained]
**What's getting easier?**: [Progress areas]
**What's still challenging?**: [Growth areas]

---
*"Tracking keeps you accountable to your highest self."* 📋`;
    }

    function createVowReflectionTemplate() {
      return `# 🤔 Vow Reflection

## 🔥 Vow Information
**Vow Name**: [Name of the vow]
**Start Date**: [When you began]
**End Date**: [When it ended or will end]
**Duration**: [Total time committed]

### 📝 Deep Reflection
**What did I learn about myself?**: [Self-discovery]
**How did this vow change me?**: [Personal transformation]
**What was the most challenging part?**: [Growth areas]
**What was the most rewarding part?**: [Success areas]

### 🔮 Spiritual Insights
**What did I learn about commitment?**: [Commitment insights]
**How did this affect my spiritual practice?**: [Spiritual growth]
**What did I learn about discipline?**: [Discipline insights]
**How did this strengthen my character?**: [Character development]

### 📊 Impact Analysis
**On my daily life**: [Daily life changes]
**On my relationships**: [Relationship impacts]
**On my goals**: [Goal achievement]
**On my future**: [Future implications]

### 🎯 Lessons for Future Vows
**What would I do differently?**: [Improvements]
**What worked really well?**: [Success factors]
**What type of vow should I take next?**: [Future planning]
**How can I apply these lessons?**: [Application]

---
*"Reflection turns experience into wisdom."* 🤔`;
    }

    function createVowCompletionTemplate() {
      return `# ✅ Vow Completion

## 🔥 Vow Information
**Vow Name**: [Name of the vow]
**Start Date**: [When you began]
**Completion Date**: ${new Date().toLocaleDateString()}
**Total Duration**: [How long it lasted]

### 🎉 Completion Celebration
**How I'm celebrating**: [Celebration plans]
**What I'm grateful for**: [Gratitude list]
**Who I want to thank**: [People to thank]
**How I'm honoring this achievement**: [Honoring methods]

### 📊 Final Results
**Did I complete the vow?**: [Yes/No/Partially]
**What I accomplished**: [Specific achievements]
**What I learned**: [Key learnings]
**How I grew**: [Personal growth]

### 🔮 Spiritual Completion
**Ritual of completion**: [Completion ritual]
**Release ceremony**: [How to release the vow]
**Integration period**: [How to integrate the experience]
**Next steps**: [What comes next]

### 📝 Legacy
**How this vow will continue to serve me**: [Ongoing benefits]
**What I want to remember**: [Key memories]
**How this shapes my future**: [Future impact]
**What I'm taking forward**: [What to carry forward]

---
*"Completion is not the end, but the beginning of something new."* ✅`;
    }

    function createLiminalSpacesTemplate() {
      return `# 🚪 Liminal Spaces

## 🧭 Current Liminal Space
**Date**: ${new Date().toLocaleDateString()}
**Type**: [Career change, relationship shift, spiritual awakening, etc.]
**Duration**: [How long you've been here]

### 🎯 What's Ending
**Old Identity**: [Who you were]
**Old Patterns**: [What's falling away]
**Old Beliefs**: [What you're letting go of]
**Old Relationships**: [What's changing]

### 🌱 What's Beginning
**New Identity**: [Who you're becoming]
**New Patterns**: [What's emerging]
**New Beliefs**: [What you're embracing]
**New Relationships**: [What's forming]

### 🚪 The Threshold Experience
**Sensations**: [What it feels like]
**Challenges**: [What's difficult]
**Gifts**: [What you're learning]
**Signs**: [What you're noticing]

### 📍 Navigation Tools
**Daily Practices**: [What helps you navigate]
**Support Systems**: [Who/what supports you]
**Signs of Progress**: [How you know you're moving forward]
**Patience Practices**: [How to be patient]

---
*"Liminal spaces are where transformation happens."* 🚪`;
    }

    function createIntegrationTemplate() {
      return `# 🔄 Integration Periods

## 🧭 Current Integration
**Date**: ${new Date().toLocaleDateString()}
**What I'm Integrating**: [Insights, experiences, changes]
**Duration**: [How long this integration will take]

### 📝 What Needs Integration
**Insights**: [What I learned]
**Experiences**: [What I experienced]
**Changes**: [What changed]
**Growth**: [How I grew]

### 🔄 Integration Process
**Daily Integration**: [How to integrate daily]
**Weekly Reflection**: [Weekly integration practices]
**Monthly Review**: [Monthly integration check-ins]
**Ongoing Process**: [Continuous integration]

### 🎯 Integration Tools
**Journaling**: [How to journal about integration]
**Meditation**: [Meditation for integration]
**Movement**: [Physical practices for integration]
**Community**: [How community supports integration]

### 📊 Integration Tracking
**Progress**: [How integration is going]
**Challenges**: [What's difficult to integrate]
**Breakthroughs**: [Integration breakthroughs]
**Completion**: [When integration feels complete]

---
*"Integration turns experience into wisdom."* 🔄`;
    }

    function createTransformationTemplate() {
      return `# 📅 Transformation Timeline

## 🎯 Personal Evolution
**Start Date**: [When your transformation began]
**Current Date**: ${new Date().toLocaleDateString()}
**Total Duration**: [How long the transformation has been happening]

### 📍 Major Milestones
**Milestone 1**: [Date and description]
**Milestone 2**: [Date and description]
**Milestone 3**: [Date and description]
**Milestone 4**: [Date and description]

### 🔄 Transformation Phases
**Phase 1 - Awakening**: [When and what happened]
**Phase 2 - Initiation**: [When and what happened]
**Phase 3 - Integration**: [When and what happened]
**Phase 4 - Mastery**: [When and what happened]

### 📊 Growth Metrics
**Personal Growth**: [How you've grown personally]
**Spiritual Growth**: [How you've grown spiritually]
**Professional Growth**: [How you've grown professionally]
**Relationship Growth**: [How your relationships have grown]

### 🎯 Future Transformation
**Next Phase**: [What's coming next]
**Goals**: [Transformation goals]
**Preparation**: [How to prepare]
**Timeline**: [Expected timeline]

---
*"Transformation is a journey, not a destination."* 📅`;
    }

    function createTarotTemplate() {
      return `# 🎴 Tarot Reading

## 🔮 Reading Information
**Date**: ${new Date().toLocaleDateString()}
**Time**: [Time of reading]
**Deck Used**: [Which tarot deck]
**Spread**: [Type of spread used]

### 🎯 Question/Intention
**Primary Question**: [Your main question]
**Secondary Questions**: [Additional questions]
**Intention**: [What you hope to learn]
**Focus Area**: [Area of life to focus on]

### 🃏 Cards Drawn
**Card 1**: [Card name and position]
- **Upright/Reversed**: [Orientation]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]

**Card 2**: [Card name and position]
- **Upright/Reversed**: [Orientation]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]

**Card 3**: [Card name and position]
- **Upright/Reversed**: [Orientation]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]

### 📝 Reading Summary
**Overall Message**: [Main message of the reading]
**Key Insights**: [Key insights gained]
**Action Items**: [What to do next]
**Timeline**: [When to expect things]

---
*"The cards are a mirror reflecting your inner wisdom."* 🎴`;
    }

    function createAstrologyTemplate() {
      return `# ⭐ Astrology Chart

## 🌟 Chart Information
**Date**: ${new Date().toLocaleDateString()}
**Birth Date**: [Your birth date]
**Birth Time**: [Your birth time]
**Birth Location**: [Your birth location]

### 🏠 Houses
**1st House (Ascendant)**: [Sign and degree]
**2nd House**: [Sign and degree]
**3rd House**: [Sign and degree]
**4th House (IC)**: [Sign and degree]
**5th House**: [Sign and degree]
**6th House**: [Sign and degree]
**7th House (Descendant)**: [Sign and degree]
**8th House**: [Sign and degree]
**9th House**: [Sign and degree]
**10th House (MC)**: [Sign and degree]
**11th House**: [Sign and degree]
**12th House**: [Sign and degree]

### 🪐 Planets
**Sun**: [Sign, house, and aspects]
**Moon**: [Sign, house, and aspects]
**Mercury**: [Sign, house, and aspects]
**Venus**: [Sign, house, and aspects]
**Mars**: [Sign, house, and aspects]
**Jupiter**: [Sign, house, and aspects]
**Saturn**: [Sign, house, and aspects]
**Uranus**: [Sign, house, and aspects]
**Neptune**: [Sign, house, and aspects]
**Pluto**: [Sign, house, and aspects]

### 📊 Chart Analysis
**Dominant Elements**: [Fire, Earth, Air, Water]
**Dominant Modalities**: [Cardinal, Fixed, Mutable]
**Key Aspects**: [Important planetary aspects]
**Life Themes**: [Major life themes]

---
*"Your birth chart is your cosmic blueprint."* ⭐`;
    }

    function createRuneTemplate() {
      return `# ᚠ Rune Casting

## 🔮 Casting Information
**Date**: ${new Date().toLocaleDateString()}
**Time**: [Time of casting]
**Rune Set**: [Which rune set used]
**Method**: [How you cast the runes]

### 🎯 Question/Intention
**Primary Question**: [Your main question]
**Focus Area**: [Area of life to focus on]
**Intention**: [What you hope to learn]

### ᚠ Runes Drawn
**Rune 1**: [Rune name]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]
- **Position**: [Where it appeared]

**Rune 2**: [Rune name]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]
- **Position**: [Where it appeared]

**Rune 3**: [Rune name]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]
- **Position**: [Where it appeared]

### 📝 Reading Summary
**Overall Message**: [Main message of the casting]
**Key Insights**: [Key insights gained]
**Guidance**: [What guidance you received]
**Action Items**: [What to do next]

---
*"The runes speak the language of the ancient ones."* ᚠ`;
    }

    function createOracleTemplate() {
      return `# 🔮 Oracle Reading

## 🔮 Reading Information
**Date**: ${new Date().toLocaleDateString()}
**Time**: [Time of reading]
**Deck Used**: [Which oracle deck]
**Spread**: [Type of spread used]

### 🎯 Question/Intention
**Primary Question**: [Your main question]
**Secondary Questions**: [Additional questions]
**Intention**: [What you hope to learn]
**Focus Area**: [Area of life to focus on]

### 🔮 Cards Drawn
**Card 1**: [Card name and position]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]
- **Message**: [Specific message for you]

**Card 2**: [Card name and position]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]
- **Message**: [Specific message for you]

**Card 3**: [Card name and position]
- **Meaning**: [Traditional meaning]
- **Personal Interpretation**: [What it means to you]
- **Message**: [Specific message for you]

### 📝 Reading Summary
**Overall Message**: [Main message of the reading]
**Key Insights**: [Key insights gained]
**Guidance**: [What guidance you received]
**Action Items**: [What to do next]

---
*"Oracle cards are messengers from the divine."* 🔮`;
    }

    // Make functions globally available
    window.toggleRitualMode = toggleRitualMode;
    window.showRitualMode = showRitualMode;
    window.createRitualTemplate = createRitualTemplate;
  }
}); 