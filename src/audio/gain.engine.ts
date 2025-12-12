import { createSignal, type Accessor, type Setter } from "solid-js";
import { updateAudioParamValue, type IAudioEngine } from "./engine";

export type GainPorts = {
    input: GainNode;
    output: GainNode;
    gain: AudioParam;
};

export class GainEngine implements IAudioEngine<GainNode, GainPorts> {
    id: string;
    name: string = "Gain";
    ctx: AudioContext;
    gain: GainNode;
    ports: GainPorts;
    engineType = "gain" as const;

    readonly gainSignal: [Accessor<number>, Setter<number>];

    constructor(ctx: AudioContext, id: string = crypto.randomUUID()) {
        this.id = id;
        this.ctx = ctx;
        this.gain = ctx.createGain();
        this.gain.gain.value = 1.0;

        this.gainSignal = createSignal(this.gain.gain.value);

        this.ports = {
            input: this.gain,
            output: this.gain,
            gain: this.gain.gain,
        };
    }

    setAudioParams(props: Partial<{ gain: number | [number, number] }>) {
        updateAudioParamValue(this.ctx, this.gain, props);
        if (props.gain !== undefined) {
            this.gainSignal[1](Array.isArray(props.gain) ? props.gain[0] : props.gain);
        }
    }

    getGain(): number {
        return this.gain.gain.value;
    }

    connect(destination: AudioNode): void {
        this.ports.output.connect(destination);
    }

    disconnect(): void {
        this.ports.output.disconnect();
    }

    modulate(portName: keyof GainPorts, modulator: AudioNode): void {
        const port = this.ports[portName];
        if (port instanceof AudioParam) {
            modulator.connect(port);
        } else {
            throw new Error(`Port "${portName}" is not modulate-able (not an AudioParam).`);
        }
    }

    tick(): void {
        console.log(`Tick for GainEngine ${this.id}`);
    }

    cleanup(): void {
        console.log(`Cleaning up GainEngine ${this.id}`);
        this.disconnect();
    }
}

export function isGainEngine(obj: any): obj is GainEngine & { gain: GainNode } {
    return obj && obj.gain instanceof GainNode;
}
