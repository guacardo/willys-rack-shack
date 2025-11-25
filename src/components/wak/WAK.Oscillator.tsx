import { createSignal, onCleanup } from "solid-js";
import { OscillatorEngine } from "@/audio/oscillator.engine";

const ctx = new window.AudioContext();

export function Oscillator() {
    const oscEngine = new OscillatorEngine(ctx);

    const [freq, setFreq] = createSignal(oscEngine.getFrequency());
    const [type, setType] = createSignal<OscillatorType>(oscEngine.getType());

    // Poll actual frequency (for modulation, if any)
    const [actualFreq, setActualFreq] = createSignal(oscEngine.getFrequency());
    const poller = setInterval(() => setActualFreq(oscEngine.getFrequency()), 30);
    onCleanup(() => clearInterval(poller));

    // UI handlers
    const handleFreqChange = (e: Event) => {
        const value = +(e.target as HTMLInputElement).value;
        setFreq(value);
        oscEngine.setFrequency(value);
    };

    const handleTypeChange = (e: Event) => {
        const value = (e.target as HTMLSelectElement).value as OscillatorType;
        setType(value);
        oscEngine.setType(value);
    };

    return (
        <div>
            <label>
                Frequency (Hz):
                <input type="range" min="50" max="2000" value={freq()} onInput={handleFreqChange} />
                <span>
                    {freq()} (actual: {actualFreq()})
                </span>
            </label>
            <label>
                Type:
                <select value={type()} onChange={handleTypeChange}>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>
        </div>
    );
}
