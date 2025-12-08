import { isPortConnected } from "@/stores/connections.store";
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

    constructor(ctx: AudioContext, id: string = crypto.randomUUID()) {
        this.id = id;
        this.ctx = ctx;
        this.gain = ctx.createGain();
        this.gain.gain.value = 1.0;

        this.ports = {
            input: this.gain,
            output: this.gain,
            gain: this.gain.gain,
        };
    }

    setAudioParams(props: Partial<{ gain: number | [number, number] }>) {
        updateAudioParamValue(this.ctx, this.gain, props);
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

    isPortConnected(portName: keyof GainPorts): boolean {
        let connected = false;
        connected = isPortConnected({ id: this.id, type: "gain", port: portName });
        return connected;
    }

    cleanup(): void {
        console.log(`Cleaning up GainEngine ${this.id}`);
        this.disconnect();
    }
}

export function isGainEngine(obj: any): obj is GainEngine & { gain: GainNode } {
    return obj && obj.gain instanceof GainNode;
}
