import { audioEngine } from "../audioEngine";
import { drumEngine } from "../../audio/DrumEngine";
import { getChordTones, getSolidNotes, getChordName } from "../chords/chordTheory";

// Reusing existing SynthEngine
class SynthInstrument {
  constructor(name, waveform) {
    this.name = name;
    this.waveform = waveform;
  }

  play(event, tonicFreq) {
    if (event.type !== 'chord' || !event.roman) return;

    // Use existing chord theory to calculate notes
    const tones = getChordTones(event.roman, event.isMajorMode, tonicFreq);
    let notes = getSolidNotes(tones, event.qualityIndex, event.isMajorMode);
    
    if (event.thumbDown) {
      notes = notes.map((f) => f / 2);
    }

    // Reuse SynthEngine
    audioEngine.synth.setWaveform(this.waveform);
    audioEngine.synth.triggerPolyphonic(notes, 1.0);
  }

  stop() {
    audioEngine.synth.releaseAll();
  }
}

// Reusing existing DrumEngine
class DrumInstrument {
  constructor(name) {
    this.name = name;
  }

  play(event) {
    if (event.type !== 'drum' || !event.instrument) return;
    
    const drumSoundMap = {
      kick: 0,
      snare: 1,
      hihat: 2,
      openhat: 3,
      crash: 4
    };

    const index = drumSoundMap[event.instrument];
    if (index !== undefined) {
      drumEngine.triggerDrum(index);
    }
  }

  stop() {
    // Drums usually decay naturally
  }
}

export const instrumentRegistry = {
  guitar: new SynthInstrument("Guitar", "triangle"),
  piano: new SynthInstrument("Piano", "sine"),
  bass: new SynthInstrument("Bass", "square"),
  drums: new DrumInstrument("Drums")
};
