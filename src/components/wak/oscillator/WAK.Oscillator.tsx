import { createSignal, onCleanup } from "solid-js";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { WUTInput } from "../../wut/input/WUT.Input";

export interface WAKOscillatorProps {
    engine: OscillatorEngine;
}

export function Oscillator({ engine }: WAKOscillatorProps) {
    // Poll oscillator values for reactivity
    const [actualFreq, setActualFreq] = createSignal(engine.getFrequency());
    const [actualDetune, setActualDetune] = createSignal(engine.getDetune());
    const [actualType, setActualType] = createSignal(engine.getType());

    const poller = setInterval(() => {
        setActualFreq(engine.getFrequency());
        setActualDetune(engine.getDetune());
        setActualType(engine.getType());
    }, 30);
    onCleanup(() => clearInterval(poller));

    const handleChange = (key: "frequency" | "type" | "detune") => (e: Event) => {
        const rawValue = (e.target as HTMLInputElement | HTMLSelectElement).value;
        let value: number | OscillatorType;
        switch (key) {
            case "type":
                value = rawValue as OscillatorType;
                break;
            case "frequency":
            case "detune":
                value = Number(rawValue);
                break;
        }
        engine.setProps({ [key]: value });
    };

    return (
        <div class={styles.oscillator}>
            <label>
                <WUTInput type="range" min="50" max="2000" value={actualFreq()} onInput={handleChange("frequency")} />
                <WUTText variant="subheader">Frequency: {actualFreq()}</WUTText>
            </label>
            <label>
                <WUTInput type="range" min="-1200" max="1200" value={actualDetune().toString()} onInput={handleChange("detune")} />
                <WUTText variant="subheader">Detune: {actualDetune()}</WUTText>
            </label>
            <label>
                Type:
                <select value={actualType()} onChange={handleChange("type")}>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>
        </div>
    );
}
