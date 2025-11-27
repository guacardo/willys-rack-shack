import type { IAudioEngine } from "./engine";

type OscillatorPorts = {
    output: OscillatorNode;
    frequency: AudioParam;
    detune: AudioParam;
};

export class OscillatorEngine implements IAudioEngine {
    ctx: AudioContext;
    osc: OscillatorNode;
    ports: OscillatorPorts;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.osc = ctx.createOscillator();
        this.osc.type = "sine";
        this.osc.frequency.value = 220;
        this.osc.start();

        this.ports = {
            output: this.osc,
            frequency: this.osc.frequency,
            detune: this.osc.detune,
        };
    }

    setFrequency(freq: number): void {
        this.ports.frequency.value = freq;
    }

    getFrequency(): number {
        return this.ports.frequency.value;
    }

    setType(type: OscillatorType): void {
        this.osc.type = type;
    }

    getType(): OscillatorType {
        return this.osc.type;
    }

    connect(destination: AudioNode): void {
        this.ports.output.connect(destination);
    }

    disconnect(): void {
        this.ports.output.disconnect();
    }

    modulate(portName: keyof OscillatorPorts, modulator: AudioNode): void {
        const port = this.ports[portName];
        if (port instanceof AudioParam) {
            modulator.connect(port);
        } else {
            throw new Error(`Port "${portName}" is not modulate-able (not an AudioParam).`);
        }
    }
}
