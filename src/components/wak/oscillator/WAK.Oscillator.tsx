import { createSignal, onCleanup } from "solid-js";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { WUTInput } from "../../wut/input/WUT.Input";

export interface WAKOscillatorProps {
    engine: OscillatorEngine;
}

export function Oscillator({ engine }: WAKOscillatorProps) {
    const [freq, setFreq] = createSignal(engine.getFrequency());
    const [type, setType] = createSignal<OscillatorType>(engine.getType());
    const [detune, setDetune] = createSignal(engine.getDetune());

    // Poll actual frequency (for modulation, if any)
    const [actualFreq, setActualFreq] = createSignal(engine.getFrequency());
    const poller = setInterval(() => setActualFreq(engine.getFrequency()), 30);
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
        engine.setProps({ [key]: value });
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
