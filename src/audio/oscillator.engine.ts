export class OscillatorEngine {
    ctx: AudioContext;
    osc: OscillatorNode;
    gain: GainNode;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.osc = ctx.createOscillator();
        this.gain = ctx.createGain();
        this.osc.connect(this.gain).connect(ctx.destination);
        this.osc.type = "sine";
        this.osc.frequency.value = 220;
        this.gain.gain.value = 0.1;
        this.osc.start();
    }

    setFrequency(freq: number) {
        this.osc.frequency.value = freq;
    }

    getFrequency() {
        return this.osc.frequency.value;
    }

    setType(type: OscillatorType) {
        this.osc.type = type;
    }

    getType() {
        return this.osc.type;
    }
}
