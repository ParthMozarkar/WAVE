/**
 * WAVE — Session History Manager
 * 
 * Logs chronological chord events:
 * - Timestamp (HH:MM:SS)
 * - Gesture name
 * - Full Chord Name + Degree
 * - Confidence percentage
 * 
 * Shows most recent first.
 * Persists up to 50 events in localStorage.
 * Includes clear history support and event listeners.
 */

export const HISTORY_STORAGE_KEY = "wave_session_history_v2";
export const MAX_HISTORY_ITEMS = 50;

export class SessionHistory {
  constructor() {
    this.entries = [];
    this.listeners = [];
    this.lastEntrySignature = null;
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.entries = parsed.slice(0, MAX_HISTORY_ITEMS);
        }
      }
    } catch (e) {
      console.warn("Failed to load session history:", e);
      this.entries = [];
    }
  }

  save() {
    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(this.entries.slice(0, MAX_HISTORY_ITEMS))
      );
    } catch (e) {
      console.warn("Failed to save session history:", e);
    }
  }

  /**
   * Log an accepted chord event
   * @param {{
   *   gesture: string,
   *   chord: string,
   *   roman: string,
   *   confidence: number
   * }} item
   */
  logEvent(item) {
    if (!item || !item.chord) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0]; // HH:MM:SS

    // Deduplicate rapid re-triggers of identical chord signature within 500ms
    const signature = `${item.chord}_${item.roman}_${item.gesture}`;
    if (this.lastEntrySignature === signature && this.entries.length > 0) {
      const last = this.entries[0];
      if (last.signature === signature && now.getTime() - last.rawTime < 600) {
        return;
      }
    }
    this.lastEntrySignature = signature;

    const entry = {
      id: "hist_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      time: timeStr,
      rawTime: now.getTime(),
      gesture: item.gesture || "Gesture",
      chord: item.chord,
      roman: item.roman,
      confidence: Math.round(item.confidence || 0),
      signature,
    };

    // Most recent first
    this.entries.unshift(entry);

    if (this.entries.length > MAX_HISTORY_ITEMS) {
      this.entries.length = MAX_HISTORY_ITEMS;
    }

    this.save();
    this.notify();
  }

  clear() {
    this.entries = [];
    this.lastEntrySignature = null;
    this.save();
    this.notify();
  }

  getEntries() {
    return [...this.entries];
  }

  onChange(cb) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.entries);
      } catch (e) {
        console.error("History listener error:", e);
      }
    });
  }
}
