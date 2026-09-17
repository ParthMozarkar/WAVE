import { useState, useRef, useEffect, useCallback } from "react";
import { GestureMappingManager } from "../gestures/mapping.js";

export function useGestureMapping() {
  const managerRef = useRef(null);
  if (!managerRef.current) {
    managerRef.current = new GestureMappingManager();
  }
  const manager = managerRef.current;

  const [mappings, setMappings] = useState(() => ({ ...manager.mappings }));

  useEffect(() => {
    return manager.onChange((updated) => {
      setMappings({ ...updated });
    });
  }, [manager]);

  const setMapping = useCallback((gestureId, degree) => {
    manager.setMapping(gestureId, degree);
    setMappings({ ...manager.mappings });
  }, [manager]);

  const saveMappings = useCallback(() => {
    return manager.save();
  }, [manager]);

  const resetToDefault = useCallback(() => {
    manager.resetToDefault();
    setMappings({ ...manager.mappings });
  }, [manager]);

  const applyPreset = useCallback((presetName) => {
    manager.applyPreset(presetName);
    setMappings({ ...manager.mappings });
  }, [manager]);

  return {
    mappingManager: manager,
    mappings,
    setMapping,
    saveMappings,
    resetToDefault,
    applyPreset,
  };
}
