import { addEngine } from "@/stores/engines.store";
import { updateAudioParamValue, type IAudioEngine } from "./engine";
import { createSignal, type Accessor, type Setter } from "solid-js";
import type { EnginePortMap, Terminal } from "@/stores/connections.store";

export type OscillatorPorts = {
    output: OscillatorNode;
    frequency: AudioParam;
    detune: AudioParam;
    dutyCycle: AudioParam;
};

export class OscillatorEngine implements IAudioEngine<OscillatorNode, OscillatorPorts> {
    id: string;
    name: string = "Oscillator";
    ctx: AudioContext;
    osc: OscillatorNode;
    ports: OscillatorPorts;
    dutyCycle: ConstantSourceNode;
    engineType = "oscillator" as const;

    // Signals for UI reactivity
    readonly frequencySignal: [Accessor<number>, Setter<number>];
    readonly detuneSignal: [Accessor<number>, Setter<number>];
    readonly dutyCycleSignal: [Accessor<number>, Setter<number>];
    readonly typeSignal: [Accessor<OscillatorType>, Setter<OscillatorType>];

    constructor(ctx: AudioContext, id: string = crypto.randomUUID()) {
        this.id = id;
        this.ctx = ctx;
        this.osc = ctx.createOscillator();
        this.osc.type = "sine";
        this.osc.frequency.value = 220;
        this.osc.start();
        this.dutyCycle = ctx.createConstantSource();
        this.dutyCycle.start();

        // Signals for UI
        this.frequencySignal = createSignal(this.osc.frequency.value);
        this.detuneSignal = createSignal(this.osc.detune.value);
        this.dutyCycleSignal = createSignal(this.dutyCycle.offset.value);
        this.typeSignal = createSignal<OscillatorType>(this.osc.type);

        this.ports = {
            output: this.osc,
            frequency: this.osc.frequency,
            detune: this.osc.detune,
            dutyCycle: this.dutyCycle.offset,
        };

        addEngine(this);
    }

    setAudioParams(props: Partial<{ frequency: number | [number, number]; detune: number | [number, number]; type: OscillatorType }>) {
        updateAudioParamValue(this.ctx, this.osc, props);
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

    setPulseWave(duty: number) {
        const safeDuty = Math.max(0.01, Math.min(0.99, duty));
        const n = 4096;
        const real = new Float32Array(n);
        const imag = new Float32Array(n);

        for (let i = 1; i < n; i++) {
            real[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * safeDuty);
            imag[i] = 0;
        }

        const wave = this.ctx.createPeriodicWave(real, imag);
        this.osc.setPeriodicWave(wave);
        this.dutyCycleSignal[1](safeDuty);
    }

    terminal(port: EnginePortMap["oscillator"]): Terminal {
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

    getDutyCycle() {
        return this.dutyCycleSignal[0]();
    }

    getType() {
        return this.typeSignal[0]();
    }

    tick(): void {
        console.log(`Ticking OscillatorEngine ${this.id}`);
    }

    cleanup(): void {
        console.log(`Cleaning up OscillatorEngine ${this.id}`);
        this.osc.stop();
        this.osc.disconnect();
    }
}

export function isOscillatorEngine(obj: any): obj is OscillatorEngine & { osc: OscillatorNode } {
    return obj.engineType === "oscillator" && obj.osc instanceof OscillatorNode;
}
