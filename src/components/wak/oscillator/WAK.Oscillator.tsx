import { createSignal, onCleanup } from "solid-js";
import { useWebAudioContext } from "@/contexts/web-audio-context";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { WUTInput } from "../../wut/input/WUT.Input";
import type { IAudioEngine } from "@/audio/engine";

export function Oscillator({ onEngineReady }: { onEngineReady?: (engine: IAudioEngine) => void }) {
    const { audioCtx } = useWebAudioContext();
    const oscEngine = new OscillatorEngine(audioCtx);

    const [freq, setFreq] = createSignal(oscEngine.getFrequency());
    const [type, setType] = createSignal<OscillatorType>(oscEngine.getType());

    onEngineReady?.(oscEngine);

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
        <div class={styles.oscillator}>
            <label>
                <WUTInput type="range" min="50" max="2000" value={freq().toString()} onInput={handleFreqChange} />
                <WUTText variant="subheader">
                    {freq()} (actual: {actualFreq()})
                </WUTText>
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
