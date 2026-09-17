import { useState, useRef, useEffect, useCallback } from "react";
import { SessionHistory } from "../history/sessionHistory.js";

export function useSessionHistory() {
  const historyRef = useRef(null);
  if (!historyRef.current) {
    historyRef.current = new SessionHistory();
  }
  const history = historyRef.current;

  const [entries, setEntries] = useState(() => history.getEntries());

  useEffect(() => {
    return history.onChange((updated) => {
      setEntries([...updated]);
    });
  }, [history]);

  const logEvent = useCallback((item) => {
    history.logEvent(item);
  }, [history]);

  const clearHistory = useCallback(() => {
    history.clear();
    setEntries([]);
  }, [history]);

  return {
    history,
    entries,
    logEvent,
    clearHistory,
  };
}
