import { useState, useEffect } from 'react';

export function useSessionClock(startTime) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    const tick = () => {
      const now = Date.now();
      if (now >= startTime) {
        setElapsed(now - startTime);
      }
      requestAnimationFrame(tick);
    };
    
    const req = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(req);
  }, [startTime]);

  return { elapsed };
}
