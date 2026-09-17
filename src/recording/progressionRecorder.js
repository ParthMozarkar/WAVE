/**
 * WAVE — Chord Progression Recorder & Looper
 * 
 * Records chord progression events with relative timestamps:
 * [ { chord, degree, roman, isMajorMode, qualityIndex, thumbDown, time, notes } ]
 * 
 * Supports playback with original relative timing, seamless looping,
 * timeline event callbacks, and smooth crossfade via SynthEngine.
 */

export class ProgressionRecorder {
  constructor() {
    this.events = [];
    this.isRecording = false;
    this.isPlaying = false;
    this.isLooping = false;
    this.recordStartTime = 0;
    this.lastRecordedKey = null;

    this.playbackTimeouts = [];
    this.playbackActiveIndex = -1;
    this.onStateChangeCallback = null;
    this.onStepCallback = null;
  }

  /**
   * Start recording session
   */
  startRecording() {
    this.events = [];
    this.isRecording = true;
    this.recordStartTime = performance.now();
    this.lastRecordedKey = null;
    this.stopPlayback();
    this.notifyState();
  }

  /**
   * Stop recording session
   */
  stopRecording() {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.lastRecordedKey = null;
    this.notifyState();
  }

  /**
   * Record a chord change event if recording is active and gesture is confident
   * @param {{
   *   chord: string,
   *   degree: string,
   *   roman: string,
   *   isMajorMode: boolean,
   *   qualityIndex: number,
   *   thumbDown: boolean,
   *   notes: number[]
   * }} chordEvent
   */
  recordEvent(chordEvent) {
    if (!this.isRecording) return;
    if (!chordEvent || !chordEvent.chord || !chordEvent.notes || chordEvent.notes.length === 0) return;

    const eventKey = `${chordEvent.chord}-${chordEvent.roman}-${chordEvent.qualityIndex}-${chordEvent.thumbDown}`;

    // Prevent recording consecutive duplicates
    if (eventKey === this.lastRecordedKey) return;
    this.lastRecordedKey = eventKey;

    const relativeTime = Math.round(performance.now() - this.recordStartTime);

    this.events.push({
      chord: chordEvent.chord,
      degree: chordEvent.degree,
      roman: chordEvent.roman,
      isMajorMode: chordEvent.isMajorMode,
      qualityIndex: chordEvent.qualityIndex,
      thumbDown: chordEvent.thumbDown,
      notes: [...chordEvent.notes],
      time: relativeTime,
    });

    this.notifyState();
  }

  /**
   * Clear recorded events
   */
  clear() {
    this.stopPlayback();
    this.events = [];
    this.lastRecordedKey = null;
    this.notifyState();
  }

  /**
   * Toggle loop mode
   */
  toggleLoop() {
    this.isLooping = !this.isLooping;
    this.notifyState();
    return this.isLooping;
  }

  setLoop(loop) {
    this.isLooping = !!loop;
    this.notifyState();
  }

  /**
   * Play back recorded progression
   * @param {import('../audio/SynthEngine.js').SynthEngine} synth
   */
  play(synth) {
    if (this.events.length === 0) return;
    if (this.isRecording) {
      this.stopRecording();
    }
    this.stopPlayback();

    this.isPlaying = true;
    this.notifyState();

    const playSequence = () => {
      if (!this.isPlaying) return;

      const firstTime = this.events[0].time;
      // Normalize times so first chord plays at t=0
      const normalizedEvents = this.events.map((ev) => ({
        ...ev,
        offset: Math.max(0, ev.time - firstTime),
      }));

      // Total loop duration is from 0 to last event offset + comfortable duration for last chord (e.g. 1500ms)
      const lastEvent = normalizedEvents[normalizedEvents.length - 1];
      const loopDuration = lastEvent.offset + 1600;

      normalizedEvents.forEach((ev, index) => {
        const timerId = setTimeout(() => {
          if (!this.isPlaying) return;
          this.playbackActiveIndex = index;
          if (this.onStepCallback) {
            this.onStepCallback(ev, index);
          }

          if (synth) {
            synth.playNotes(ev.notes);
            synth.setVolume(0.85);
          }
        }, ev.offset);

        this.playbackTimeouts.push(timerId);
      });

      // Loop or finish
      const endTimer = setTimeout(() => {
        if (!this.isPlaying) return;
        if (this.isLooping) {
          playSequence();
        } else {
          this.stopPlayback();
          if (synth) {
            synth.fadeOut(0.3);
          }
        }
      }, loopDuration);

      this.playbackTimeouts.push(endTimer);
    };

    playSequence();
  }

  /**
   * Stop progression playback
   * @param {import('../audio/SynthEngine.js').SynthEngine} [synth]
   */
  stopPlayback(synth) {
    this.playbackTimeouts.forEach((id) => clearTimeout(id));
    this.playbackTimeouts = [];
    this.isPlaying = false;
    this.playbackActiveIndex = -1;
    if (this.onStepCallback) {
      this.onStepCallback(null, -1);
    }
    if (synth) {
      synth.fadeOut(0.2);
    }
    this.notifyState();
  }

  onStateChange(cb) {
    this.onStateChangeCallback = cb;
  }

  onStep(cb) {
    this.onStepCallback = cb;
  }

  notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isRecording: this.isRecording,
        isPlaying: this.isPlaying,
        isLooping: this.isLooping,
        eventCount: this.events.length,
        events: [...this.events],
        activeIndex: this.playbackActiveIndex,
      });
    }
  }
}
