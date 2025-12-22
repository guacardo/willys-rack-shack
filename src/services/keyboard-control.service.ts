import { isKeyboardControllable } from "@/audio/engine";
import { GainEngine, isGainEngine } from "@/audio/gain.engine";
import { isOscillatorEngine, OscillatorEngine } from "@/audio/oscillator.engine";
import { getEngineById } from "@/stores/engines.store";
import { getGroup, getMembersOfGroup, registerKeyboardController } from "@/stores/groups.store";
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

// Keyboard mapping: Computer keyboard -> MIDI notes
// Standard piano keyboard layout (2 octaves)
const KEYBOARD_TO_MIDI: Record<string, number> = {
    // Lower octave (C3-B3): Z-M keys (bottom row)
    z: 48, // C3
    s: 49, // C#3
    x: 50, // D3
    d: 51, // D#3
    c: 52, // E3
    v: 53, // F3
    g: 54, // F#3
    b: 55, // G3
    h: 56, // G#3
    n: 57, // A3
    j: 58, // A#3
    m: 59, // B3

    // Upper octave (C4-B4): Q-U keys (top row)
    q: 60, // C4 (Middle C)
    "2": 61, // C#4
    w: 62, // D4
    "3": 63, // D#4
    e: 64, // E4
    r: 65, // F4
    "5": 66, // F#4
    t: 67, // G4
    "6": 68, // G#4
    y: 69, // A4
    "7": 70, // A#4
    u: 71, // B4
    i: 72, // C5
};

export class KeyboardInputManager {
    private activeKeys = new Set<string>();
    private activeNotes = new Map<string, number>(); // key -> MIDI note
    private enabled = false;

    onNoteOn?: (midiNote: number, velocity: number) => void;
    onNoteOff?: (midiNote: number) => void;

    constructor() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    enable() {
        if (this.enabled) return;
        this.enabled = true;
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        console.log("Keyboard input enabled");
    }

    disable() {
        if (!this.enabled) return;
        this.enabled = false;
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);

        // Release all active notes
        this.activeNotes.forEach((midiNote) => {
            this.onNoteOff?.(midiNote);
        });
        this.activeKeys.clear();
        this.activeNotes.clear();
        console.log("Keyboard input disabled");
    }

    private handleKeyDown(event: KeyboardEvent) {
        // Ignore if typing in an input field
        const target = event.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
            return;
        }

        const key = event.key.toLowerCase();
        const midiNote = KEYBOARD_TO_MIDI[key];

        if (midiNote === undefined) return;

        // Prevent key repeat
        if (this.activeKeys.has(key)) return;

        this.activeKeys.add(key);
        this.activeNotes.set(key, midiNote);

        // Fixed velocity for now, could add velocity sensitivity later
        const velocity = 0.8;
        this.onNoteOn?.(midiNote, velocity);

        event.preventDefault();
    }

    private handleKeyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        const midiNote = this.activeNotes.get(key);

        if (midiNote === undefined) return;

        this.activeKeys.delete(key);
        this.activeNotes.delete(key);

        this.onNoteOff?.(midiNote);

        event.preventDefault();
    }
}

// Singleton instance for global keyboard input management
export const keyboardInputManager = new KeyboardInputManager();

// Helper to enable keyboard control on a group
export function enableKeyboardControlForGroup(groupId: string): KeyboardController {
    const controller = new KeyboardController(groupId);

    // Wire up keyboard input to controller
    keyboardInputManager.onNoteOn = (note, vel) => controller.noteOn(note, vel);
    keyboardInputManager.onNoteOff = () => controller.noteOff();

    keyboardInputManager.enable();

    // Register with groups store for reactive member changes
    registerKeyboardController(groupId, controller);

    console.log(`Keyboard control enabled for group ${groupId}`);
    return controller;
}
