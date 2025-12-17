import type { EnginePortMap, Terminal } from "@/stores/connections.store";
import { updateAudioParamValue, type IAudioEngine } from "./engine";
import { createSignal, type Accessor, type Setter } from "solid-js";
import { addEngine } from "@/stores/engines.store";

export type LFOPorts = {
    output: GainNode;
    frequency: AudioParam;
    detune: AudioParam;
    depth: AudioParam;
};

export class LFOEngine implements IAudioEngine<OscillatorNode, LFOPorts> {
    id: string;
    name: string = "LFO";
    ctx: AudioContext;
    osc: OscillatorNode;
    depthControl: GainNode;
    ports: LFOPorts;
    engineType = "lfo" as const;

    // Signals for UI reactivity
    readonly frequencySignal: [Accessor<number>, Setter<number>];
    readonly detuneSignal: [Accessor<number>, Setter<number>];
    readonly depthSignal: [Accessor<number>, Setter<number>];
    readonly typeSignal: [Accessor<OscillatorType>, Setter<OscillatorType>];

    constructor(ctx: AudioContext, id: string = crypto.randomUUID()) {
        this.id = id;
        this.ctx = ctx;

        // Create oscillator with LFO-appropriate frequency
        this.osc = ctx.createOscillator();
        this.osc.type = "sine";
        this.osc.frequency.value = 1; // 1 Hz default
        this.osc.start();

        // Create depth control (gain node to scale modulation amount)
        this.depthControl = ctx.createGain();
        this.depthControl.gain.value = 100.0; // Full depth by default
        this.osc.connect(this.depthControl);

        // Signals for UI
        this.frequencySignal = createSignal(this.osc.frequency.value);
        this.detuneSignal = createSignal(this.osc.detune.value);
        this.depthSignal = createSignal(this.depthControl.gain.value);
        this.typeSignal = createSignal<OscillatorType>(this.osc.type);

        this.ports = {
            output: this.depthControl,
            frequency: this.osc.frequency,
            detune: this.osc.detune,
            depth: this.depthControl.gain,
        };

        addEngine(this);
    }

    setAudioParams(
        props: Partial<{ frequency: number | [number, number]; detune: number | [number, number]; depth: number | [number, number]; type: OscillatorType }>
    ) {
        updateAudioParamValue(this.ctx, this.osc, props);

        // Update depth if provided
        if (props.depth !== undefined) {
            if (Array.isArray(props.depth)) {
                this.depthControl.gain.linearRampToValueAtTime(props.depth[0], this.ctx.currentTime + props.depth[1]);
            } else {
                this.depthControl.gain.setValueAtTime(props.depth, this.ctx.currentTime);
                this.depthControl.gain.value = props.depth;
            }
            this.depthSignal[1](Array.isArray(props.depth) ? props.depth[0] : props.depth);
        }

        // Update signals
        if (props.frequency !== undefined) {
            this.frequencySignal[1](Array.isArray(props.frequency) ? props.frequency[0] : props.frequency);
        }
        if (props.detune !== undefined) {
            this.detuneSignal[1](Array.isArray(props.detune) ? props.detune[0] : props.detune);
        }
        if (props.type !== undefined) {
            this.typeSignal[1](props.type);
        }
    }

    terminal(port: EnginePortMap["lfo"]): Terminal {
        return {
            id: this.id,
            type: this.engineType,
            port: port,
        };
    }

    getName(): string {
        return this.name;
    }

    getFrequency() {
        return this.frequencySignal[0]();
    }

    getDetune() {
        return this.detuneSignal[0]();
    }

    getDepth() {
        return this.depthSignal[0]();
    }

    getType() {
        return this.typeSignal[0]();
    }

    connect(destination: AudioNode, output?: number, input?: number): AudioNode;
    connect(destination: AudioParam, output?: number): void;
    connect(destination: AudioNode | AudioParam, output?: number, input?: number): AudioNode | void {
        if (destination instanceof AudioNode) {
            return this.ports.output.connect(destination, output, input);
        } else {
            this.ports.output.connect(destination, output);
        }
    }

    disconnect(): void {
        this.ports.output.disconnect();
    }

    modulate(portName: keyof LFOPorts, modulator: AudioNode): void {
        const port = this.ports[portName];
        if (port instanceof AudioParam) {
            modulator.connect(port);
        } else {
            throw new Error(`Port "${portName}" is not modulate-able (not an AudioParam).`);
        }
    }

    tick(): void {
        console.log(`Ticking LFOEngine ${this.id}`);
    }

    cleanup(): void {
        console.log(`Cleaning up LFOEngine ${this.id}`);
        this.disconnect();
        this.osc.stop();
    }
}

export function isLFOEngine(obj: any): obj is LFOEngine {
    return obj && obj.engineType === "lfo" && obj.osc instanceof OscillatorNode;
}
