/**
 * WAVE — UI Manager
 * 
 * Coordinates:
 * - Gesture Mapping Modal with live chord preview and presets
 * - Chord Progression Recorder Strip with timeline chips and loop toggle
 * - Session History Panel with export/clear
 * - Real-Time Performance / Diagnostics Panel
 * - Confidence & Unclear Gesture Warning HUD
 * - Responsive modal management and toast feedback
 */

import { GESTURE_DEFINITIONS, VALID_DEGREES } from "../gestures/mapping.js";

export class UIManager {
  /**
   * @param {{
   *   mappingManager: import('../gestures/mapping.js').GestureMappingManager,
   *   progressionRecorder: import('../recording/progressionRecorder.js').ProgressionRecorder,
   *   sessionHistory: import('../history/sessionHistory.js').SessionHistory,
   *   perfMonitor: import('../performance/perfMonitor.js').PerformanceMonitor,
   *   synth: import('../audio/SynthEngine.js').SynthEngine,
   *   getKeyName: () => string,
   *   getScaleNotes: (key: string) => string[]
   * }} options
   */
  constructor(options) {
    this.mappingManager = options.mappingManager;
    this.recorder = options.progressionRecorder;
    this.history = options.sessionHistory;
    this.perf = options.perfMonitor;
    this.synth = options.synth;
    this.getKeyName = options.getKeyName;
    this.getScaleNotes = options.getScaleNotes;

    this.initElements();
    this.bindEvents();
    this.renderMappingRows();
    this.renderHistory();
    this.renderRecorderStrip({
      isRecording: false,
      isPlaying: false,
      isLooping: false,
      events: [],
      activeIndex: -1,
    });
    this.startPerfLoop();
  }

  initElements() {
    // Top Bar Buttons
    this.btnMapping = document.getElementById("btnMapping");
    this.btnRecorder = document.getElementById("btnRecorder");
    this.btnHistory = document.getElementById("btnHistory");
    this.btnPerf = document.getElementById("btnPerf");

    // Modals & Panels
    this.mappingModal = document.getElementById("mappingModal");
    this.closeMappingBtn = document.getElementById("closeMapping");
    this.saveMappingBtn = document.getElementById("saveMapping");
    this.resetMappingBtn = document.getElementById("resetMapping");
    this.presetPopBtn = document.getElementById("presetPop");
    this.presetStandardBtn = document.getElementById("presetStandard");
    this.mappingListEl = document.getElementById("mappingList");
    this.mappingKeyPreviewEl = document.getElementById("mappingKeyPreview");

    this.historyModal = document.getElementById("historyModal");
    this.closeHistoryBtn = document.getElementById("closeHistory");
    this.clearHistoryBtn = document.getElementById("clearHistory");
    this.historyListEl = document.getElementById("historyList");

    this.perfPanel = document.getElementById("perfPanel");
    this.closePerfBtn = document.getElementById("closePerf");
    this.perfFpsEl = document.getElementById("perfFps");
    this.perfLatencyEl = document.getElementById("perfLatency");
    this.perfAccuracyEl = document.getElementById("perfAccuracy");
    this.perfAcceptanceEl = document.getElementById("perfAcceptance");
    this.perfVoicesEl = document.getElementById("perfVoices");
    this.perfAudioStateEl = document.getElementById("perfAudioState");

    // Recorder Elements
    this.recorderStrip = document.getElementById("recorderStrip");
    this.recBtn = document.getElementById("recBtn");
    this.stopRecBtn = document.getElementById("stopRecBtn");
    this.playRecBtn = document.getElementById("playRecBtn");
    this.loopRecBtn = document.getElementById("loopRecBtn");
    this.clearRecBtn = document.getElementById("clearRecBtn");
    this.timelineContainer = document.getElementById("timelineContainer");
    this.recStatusEl = document.getElementById("recStatus");

    // HUD Elements
    this.confidenceHudEl = document.getElementById("confidenceHud");
    this.gestureWarningEl = document.getElementById("gestureWarning");
    this.toastEl = document.getElementById("toast");
  }

  bindEvents() {
    // Navigation toggle buttons
    if (this.btnMapping) {
      this.btnMapping.addEventListener("click", () => this.toggleModal(this.mappingModal, true));
    }
    if (this.closeMappingBtn) {
      this.closeMappingBtn.addEventListener("click", () => this.toggleModal(this.mappingModal, false));
    }
    if (this.btnHistory) {
      this.btnHistory.addEventListener("click", () => {
        this.renderHistory();
        this.toggleModal(this.historyModal, true);
      });
    }
    if (this.closeHistoryBtn) {
      this.closeHistoryBtn.addEventListener("click", () => this.toggleModal(this.historyModal, false));
    }
    if (this.btnPerf) {
      this.btnPerf.addEventListener("click", () => {
        this.perfPanel.classList.toggle("hidden");
        this.btnPerf.classList.toggle("active", !this.perfPanel.classList.contains("hidden"));
      });
    }
    if (this.closePerfBtn) {
      this.closePerfBtn.addEventListener("click", () => {
        this.perfPanel.classList.add("hidden");
        if (this.btnPerf) this.btnPerf.classList.remove("active");
      });
    }
    if (this.btnRecorder) {
      this.btnRecorder.addEventListener("click", () => {
        this.recorderStrip.classList.toggle("hidden");
        this.btnRecorder.classList.toggle("active", !this.recorderStrip.classList.contains("hidden"));
      });
    }

    // Modal background click to close
    [this.mappingModal, this.historyModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) this.toggleModal(modal, false);
        });
      }
    });

    // Mapping editor actions
    if (this.saveMappingBtn) {
      this.saveMappingBtn.addEventListener("click", () => {
        this.saveMappingsFromUI();
        this.showToast("✓ Custom mappings saved!");
        this.toggleModal(this.mappingModal, false);
      });
    }
    if (this.resetMappingBtn) {
      this.resetMappingBtn.addEventListener("click", () => {
        this.mappingManager.resetToDefault();
        this.renderMappingRows();
        this.showToast("Restored standard degree mappings");
      });
    }
    if (this.presetPopBtn) {
      this.presetPopBtn.addEventListener("click", () => {
        this.mappingManager.applyPreset("pop");
        this.renderMappingRows();
        this.showToast("Applied Four-Chord Pop Preset (I - V - vi - IV)");
      });
    }
    if (this.presetStandardBtn) {
      this.presetStandardBtn.addEventListener("click", () => {
        this.mappingManager.applyPreset("standard");
        this.renderMappingRows();
        this.showToast("Applied Standard Scale Degree Preset (I - VII)");
      });
    }

    // History actions
    if (this.clearHistoryBtn) {
      this.clearHistoryBtn.addEventListener("click", () => {
        this.history.clear();
        this.renderHistory();
        this.showToast("Session history cleared");
      });
    }

    this.history.onChange(() => {
      if (!this.historyModal.classList.contains("hidden")) {
        this.renderHistory();
      }
    });

    // Recorder actions
    if (this.recBtn) {
      this.recBtn.addEventListener("click", () => {
        if (this.recorder.isRecording) {
          this.recorder.stopRecording();
        } else {
          this.recorder.startRecording();
        }
      });
    }
    if (this.stopRecBtn) {
      this.stopRecBtn.addEventListener("click", () => {
        this.recorder.stopRecording();
        this.recorder.stopPlayback(this.synth);
      });
    }
    if (this.playRecBtn) {
      this.playRecBtn.addEventListener("click", () => {
        if (this.recorder.isPlaying) {
          this.recorder.stopPlayback(this.synth);
        } else {
          this.recorder.play(this.synth);
        }
      });
    }
    if (this.loopRecBtn) {
      this.loopRecBtn.addEventListener("click", () => {
        const isLooping = this.recorder.toggleLoop();
        this.loopRecBtn.classList.toggle("active", isLooping);
      });
    }
    if (this.clearRecBtn) {
      this.clearRecBtn.addEventListener("click", () => {
        this.recorder.clear();
        this.showToast("Recording cleared");
      });
    }

    this.recorder.onStateChange((state) => {
      this.renderRecorderStrip(state);
    });

    this.recorder.onStep((event, activeIndex) => {
      this.highlightTimelineStep(activeIndex);
    });
  }

  toggleModal(modal, show) {
    if (!modal) return;
    if (show) {
      modal.classList.remove("hidden");
      if (modal === this.mappingModal) {
        this.renderMappingRows();
      }
    } else {
      modal.classList.add("hidden");
    }
  }

  showToast(msg) {
    if (!this.toastEl) return;
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove("hidden");
    this.toastEl.classList.add("visible");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove("visible");
      setTimeout(() => this.toastEl.classList.add("hidden"), 300);
    }, 2500);
  }

  // ---- Mapping Rows ----
  renderMappingRows() {
    if (!this.mappingListEl) return;

    const currentKey = this.getKeyName();
    const scaleNotes = this.getScaleNotes(currentKey);

    if (this.mappingKeyPreviewEl) {
      this.mappingKeyPreviewEl.textContent = `Current Key: ${currentKey} Major (${scaleNotes.join(" - ")})`;
    }

    const degreeNames = {
      I: `${scaleNotes[0]} Major`,
      II: `${scaleNotes[1]} Minor`,
      III: `${scaleNotes[2]} Minor`,
      IV: `${scaleNotes[3]} Major`,
      V: `${scaleNotes[4]} Major`,
      VI: `${scaleNotes[5]} Minor`,
      VII: `${scaleNotes[6]} Diminished`,
    };

    this.mappingListEl.innerHTML = GESTURE_DEFINITIONS.map((def) => {
      const currentDegree = this.mappingManager.getDegree(def.id);
      const optionsHtml = VALID_DEGREES.map((deg) => {
        const selected = deg === currentDegree ? "selected" : "";
        return `<option value="${deg}" ${selected}>Degree ${deg} (${degreeNames[deg] || deg})</option>`;
      }).join("");

      return `
        <div class="mapping-row" data-gesture="${def.id}">
          <div class="mapping-gesture-label">${def.label}</div>
          <div class="mapping-arrow">➔</div>
          <select class="mapping-select" data-gesture="${def.id}">
            ${optionsHtml}
          </select>
        </div>
      `;
    }).join("");
  }

  saveMappingsFromUI() {
    if (!this.mappingListEl) return;
    const selects = this.mappingListEl.querySelectorAll(".mapping-select");
    selects.forEach((sel) => {
      const gestureId = sel.dataset.gesture;
      const degree = sel.value;
      this.mappingManager.setMapping(gestureId, degree);
    });
    this.mappingManager.save();
  }

  // ---- Session History ----
  renderHistory() {
    if (!this.historyListEl) return;
    const entries = this.history.getEntries();

    if (entries.length === 0) {
      this.historyListEl.innerHTML = `
        <div class="history-empty">
          No chords played yet this session.<br>
          Play chords with hand gestures to build history!
        </div>
      `;
      return;
    }

    this.historyListEl.innerHTML = entries
      .map(
        (item) => `
        <div class="history-row">
          <span class="hist-time">${item.time}</span>
          <span class="hist-gesture">${item.gesture}</span>
          <span class="hist-chord">${item.chord}</span>
          <span class="hist-conf">${item.confidence}%</span>
        </div>
      `
      )
      .join("");
  }

  // ---- Recorder Strip & Timeline ----
  renderRecorderStrip(state) {
    if (!this.recorderStrip) return;

    if (this.recBtn) {
      this.recBtn.classList.toggle("recording", state.isRecording);
      this.recBtn.textContent = state.isRecording ? "⏺ REC" : "⏺ Record";
    }

    if (this.playRecBtn) {
      this.playRecBtn.classList.toggle("active", state.isPlaying);
      this.playRecBtn.textContent = state.isPlaying ? "⏸ Pause" : "▶ Play";
      this.playRecBtn.disabled = state.events.length === 0 && !state.isPlaying;
    }

    if (this.loopRecBtn) {
      this.loopRecBtn.classList.toggle("active", state.isLooping);
    }

    if (this.recStatusEl) {
      if (state.isRecording) {
        this.recStatusEl.textContent = `Recording... (${state.events.length} chords)`;
      } else if (state.isPlaying) {
        this.recStatusEl.textContent = `Playing loop (${state.events.length} chords)`;
      } else if (state.events.length > 0) {
        this.recStatusEl.textContent = `${state.events.length} chords recorded`;
      } else {
        this.recStatusEl.textContent = "Ready to record";
      }
    }

    this.renderTimelineChips(state.events, state.activeIndex);
  }

  renderTimelineChips(events, activeIndex) {
    if (!this.timelineContainer) return;

    if (!events || events.length === 0) {
      this.timelineContainer.innerHTML = `<span class="timeline-empty">Progression timeline is empty</span>`;
      return;
    }

    this.timelineContainer.innerHTML = events
      .map((ev, i) => {
        const isActive = i === activeIndex ? "active" : "";
        const timeSec = (ev.time / 1000).toFixed(1);
        return `
          <div class="timeline-chip ${isActive}" data-index="${i}">
            <span class="chip-chord">${ev.chord}</span>
            <span class="chip-time">${timeSec}s</span>
          </div>
        `;
      })
      .join("");
  }

  highlightTimelineStep(activeIndex) {
    if (!this.timelineContainer) return;
    const chips = this.timelineContainer.querySelectorAll(".timeline-chip");
    chips.forEach((chip, i) => {
      chip.classList.toggle("active", i === activeIndex);
    });
  }

  // ---- HUD Updates ----
  updateConfidenceHud(confidence, gestureLabel, isConfident, warning) {
    if (this.confidenceHudEl) {
      if (isConfident && gestureLabel) {
        this.confidenceHudEl.textContent = `● ${confidence}% ${gestureLabel}`;
        this.confidenceHudEl.classList.remove("low");
        this.confidenceHudEl.classList.add("high");
      } else if (confidence > 0) {
        this.confidenceHudEl.textContent = `○ ${confidence}% (Unstable)`;
        this.confidenceHudEl.classList.remove("high");
        this.confidenceHudEl.classList.add("low");
      } else {
        this.confidenceHudEl.textContent = `--`;
        this.confidenceHudEl.classList.remove("high", "low");
      }
    }

    if (this.gestureWarningEl) {
      if (!isConfident && warning) {
        this.gestureWarningEl.textContent = `⚠ ${warning}`;
        this.gestureWarningEl.classList.remove("hidden");
      } else {
        this.gestureWarningEl.classList.add("hidden");
      }
    }
  }

  // ---- Performance Panel Loop ----
  startPerfLoop() {
    setInterval(() => {
      if (!this.perfPanel || this.perfPanel.classList.contains("hidden")) return;
      const m = this.perf.getMetrics(this.synth);

      if (this.perfFpsEl) this.perfFpsEl.textContent = m.fps;
      if (this.perfLatencyEl) this.perfLatencyEl.textContent = m.latencyMs;
      if (this.perfAccuracyEl) this.perfAccuracyEl.textContent = m.gestureAccuracy;
      if (this.perfAcceptanceEl) this.perfAcceptanceEl.textContent = m.acceptanceRate;
      if (this.perfVoicesEl) this.perfVoicesEl.textContent = `${m.activeVoices} (${m.oscillatorCount} osc)`;
      if (this.perfAudioStateEl) this.perfAudioStateEl.textContent = m.audioState;
    }, 200);
  }
}
