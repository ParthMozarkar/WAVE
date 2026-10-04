import { useEffect, useState } from 'react';
import { signalingService } from '../../services/multiplayer/signaling';
import { instrumentRegistry } from '../../services/multiplayer/InstrumentRegistry';

export function useMusicalSync(roomCode, currentTonicFreq) {
  useEffect(() => {
    const handleEvent = (event) => {
      // Incoming remote musical event
      const instrument = instrumentRegistry[event.instrument];
      if (instrument) {
        if (event.type === 'stop' && instrument.stop) {
          instrument.stop();
        } else {
          instrument.play(event, currentTonicFreq);
        }
      }
    };

    signalingService.on("musical-event", handleEvent);
    
    return () => {
      signalingService.off("musical-event", handleEvent);
    };
  }, [currentTonicFreq]);

  // Expose a method to broadcast local events
  const broadcastEvent = (event) => {
    signalingService.sendMusicalEvent(roomCode, event);
    // Also play locally
    const instrument = instrumentRegistry[event.instrument];
    if (instrument) {
      if (event.type === 'stop' && instrument.stop) {
        instrument.stop();
      } else {
        instrument.play(event, currentTonicFreq);
      }
    }
  };

  return { broadcastEvent };
}
