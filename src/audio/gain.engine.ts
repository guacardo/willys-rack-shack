import type { IAudioEngine } from "./engine";

type GainPorts = {
    input: GainNode;
    output: GainNode;
    gain: AudioParam;
};

export class GainEngine implements IAudioEngine {
    name: string = "Gain";
    ctx: AudioContext;
    gain: GainNode;
    ports: GainPorts;
    moduleType = "gain" as const;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.gain = ctx.createGain();
        this.gain.gain.value = 1.0;

        this.ports = {
            input: this.gain,
            output: this.gain,
            gain: this.gain.gain,
        };
    }

    setGain(value: number): void {
        this.ports.gain.value = value;
    }

    getGain(): number {
        return this.ports.gain.value;
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
}
