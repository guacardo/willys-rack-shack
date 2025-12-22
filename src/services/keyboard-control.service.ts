import { isKeyboardControllable } from "@/audio/engine";
import { GainEngine, isGainEngine } from "@/audio/gain.engine";
import { isOscillatorEngine, OscillatorEngine } from "@/audio/oscillator.engine";
import { getEngineById } from "@/stores/engines.store";
import { getGroup, getMembersOfGroup } from "@/stores/groups.store";
import { createEffect } from "solid-js";

export class KeyboardController {
    private groupId: string;
    private oscillatorOffsets: Map<string, number>;
    private envelopeGainNodes: Set<string>;
    private rootFrequency: number = 220;

    constructor(groupId: string) {
        this.groupId = groupId;
        this.oscillatorOffsets = new Map();
        this.envelopeGainNodes = new Set();

        createEffect(() => {
            const group = getGroup(this.groupId);
            if (group) {
                // Re-scan when members change
                this.scan();
            }
        });
    }

    scan() {
        this.oscillatorOffsets.clear();
        this.envelopeGainNodes.clear();

        const members = getMembersOfGroup(this.groupId);

        members.forEach((memberId) => {
            const engine = getEngineById(memberId);

            // Check if engine wants keyboard control
            if (engine && isKeyboardControllable(engine) && engine.keyboardControl.respondToKeyboard) {
                if (engine.keyboardControl.role === "pitch" && isOscillatorEngine(engine)) {
                    const currentFreq = engine.osc.frequency.value;
                    const semitoneOffset = 12 * Math.log2(currentFreq / this.rootFrequency);
                    this.oscillatorOffsets.set(memberId, semitoneOffset);
                }

                if (engine.keyboardControl.role === "envelope" && isGainEngine(engine)) {
                    this.envelopeGainNodes.add(memberId);
                }
            }
        });

        console.log(`Scanned group ${this.groupId}: ${this.oscillatorOffsets.size} oscillators, ${this.envelopeGainNodes.size} envelopes`);
    }

    noteOn(midiNote: number, velocity: number) {
        const newRootFreq = this.midiToFreq(midiNote);

        // Update all pitch-controllable oscillators
        this.oscillatorOffsets.forEach((semitoneOffset, engineId) => {
            const engine = getEngineById(engineId) as OscillatorEngine;
            if (engine) {
                const newFreq = newRootFreq * Math.pow(2, semitoneOffset / 12);
                engine.setAudioParams({ frequency: newFreq });
            }
        });

        // Trigger all envelope-controllable gains
        this.envelopeGainNodes.forEach((engineId) => {
            const engine = getEngineById(engineId) as GainEngine;
            if (engine) {
                engine.setAudioParams({ gain: [velocity, 0.01] });
            }
        });
    }

    noteOff(releaseTime: number = 0.5) {
        // Release envelope on all gain nodes
        this.envelopeGainNodes.forEach((engineId) => {
            const engine = getEngineById(engineId) as GainEngine;
            if (engine) {
                engine.setAudioParams({ gain: [0, releaseTime] });
            }
        });
    }

    setRootFrequency(freq: number) {
        this.rootFrequency = freq;
        this.scan(); // Re-calculate offsets
    }

    private midiToFreq(midiNote: number): number {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
}
