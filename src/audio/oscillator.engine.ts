import { updateAudioParamValue, type IAudioEngine } from "./engine";

export type OscillatorPorts = {
    output: OscillatorNode;
    frequency: AudioParam;
    detune: AudioParam;
};

export class OscillatorEngine implements IAudioEngine {
    id: string;
    name: string = "Oscillator";
    ctx: AudioContext;
    osc: OscillatorNode;
    ports: OscillatorPorts;
    engineType = "oscillator" as const;

    constructor(ctx: AudioContext, id: string = crypto.randomUUID()) {
        this.id = id;
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

    setName(name: string): void {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    setProps(props: Partial<{ frequency: number | [number, number]; detune: number | [number, number]; type: OscillatorType }>) {
        updateAudioParamValue(this.ctx, this.osc, props);
    }

    getFrequency() {
        return this.osc.frequency.value;
    }

    getDetune() {
        return this.osc.detune.value;
    }

    getType() {
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

export function isOscillatorEngine(obj: any): obj is OscillatorEngine & { osc: OscillatorNode } {
    return (
        obj &&
        typeof obj === "object" &&
        obj.ctx instanceof AudioContext &&
        typeof obj.ports === "object" &&
        typeof obj.connect === "function" &&
        typeof obj.disconnect === "function" &&
        obj.osc instanceof OscillatorNode
    );
}
