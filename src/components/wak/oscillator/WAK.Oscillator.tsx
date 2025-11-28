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
    const [detune, setDetune] = createSignal(oscEngine.getDetune());

    onEngineReady?.(oscEngine);

    // Poll actual frequency (for modulation, if any)
    const [actualFreq, setActualFreq] = createSignal(oscEngine.getFrequency());
    const poller = setInterval(() => setActualFreq(oscEngine.getFrequency()), 30);
    onCleanup(() => clearInterval(poller));

    const handleChange = (key: "frequency" | "type" | "detune") => (e: Event) => {
        const rawValue = (e.target as HTMLInputElement | HTMLSelectElement).value;
        let value: number | OscillatorType;
        if (key === "type") {
            value = rawValue as OscillatorType;
            setType(value);
        } else {
            value = +rawValue;
            if (key === "frequency") setFreq(value);
            if (key === "detune") setDetune(value);
        }
        oscEngine.setProps({ [key]: value });
    };

    return (
        <div class={styles.oscillator}>
            <label>
                <WUTInput type="range" min="50" max="2000" value={freq().toString()} onInput={handleChange("frequency")} />
                <WUTText variant="subheader">
                    set: {freq()} real: {actualFreq()}
                </WUTText>
            </label>
            <label>
                <WUTInput type="range" min="-1200" max="1200" value={detune().toString()} onInput={handleChange("detune")} />
                <WUTText variant="subheader">Detune: {detune()}</WUTText>
            </label>
            <label>
                Type:
                <select value={type()} onChange={handleChange("type")}>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>
        </div>
    );
}
