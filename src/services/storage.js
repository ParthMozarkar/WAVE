/**
 * WAVE — Storage Service
 * 
 * Centralized, safe localStorage persistence for gesture mappings and session history.
 */

const MAPPINGS_KEY = "wave_gesture_mapping_v2";
const HISTORY_KEY = "wave_session_history_v2";
const MAX_HISTORY = 50;

export const storage = {
  loadMappings() {
    try {
      const raw = localStorage.getItem(MAPPINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("storage.loadMappings failed:", e);
      return null;
    }
  },

  saveMappings(mappings) {
    try {
      localStorage.setItem(MAPPINGS_KEY, JSON.stringify(mappings));
      return true;
    } catch (e) {
      console.error("storage.saveMappings failed:", e);
      return false;
    }
  },

  loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
    } catch (e) {
      console.warn("storage.loadHistory failed:", e);
      return [];
    }
  },

  saveHistory(history) {
    try {
      const trimmed = Array.isArray(history) ? history.slice(0, MAX_HISTORY) : [];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.warn("storage.saveHistory failed:", e);
      return false;
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(HISTORY_KEY);
      return true;
    } catch (e) {
      console.warn("storage.clearHistory failed:", e);
      return false;
    }
  },
};
