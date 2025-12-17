import { createSignal, type Accessor, type Setter } from "solid-js";
import { updateAudioParamValue, type IAudioEngine } from "./engine";
import { addEngine } from "@/stores/engines.store";
import type { EnginePortMap, Terminal } from "@/stores/connections.store";

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

        addEngine(this);
    }

    setAudioParams(props: Partial<{ gain: number | [number, number] }>) {
        updateAudioParamValue(this.ctx, this.gain, props);
        if (props.gain !== undefined) {
            this.gainSignal[1](Array.isArray(props.gain) ? props.gain[0] : props.gain);
        }
    }

    terminal(port: EnginePortMap["gain"]): Terminal {
        return {
            id: this.id,
            type: this.engineType,
            port: port,
        };
    }

    getGain(): number {
        return this.gain.gain.value;
    }

    tick(): void {
        console.log(`Tick for GainEngine ${this.id}`);
    }

    cleanup(): void {
        console.log(`Cleaning up GainEngine ${this.id}`);
    }
}

export function isGainEngine(obj: any): obj is GainEngine {
    return obj && obj.engineType === "gain" && obj.gain instanceof GainNode;
}
