import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { getEngineById, updateEngine } from "@/stores/engines.store";
import { createMemo } from "solid-js";

export interface WAKOscillatorProps {
    id: string;
}

export function WAKOscillator({ id }: WAKOscillatorProps) {
    const engine = createMemo(() => {
        const eng = getEngineById(id);
        return isOscillatorEngine(eng) ? eng : undefined;
    });

    const handleChange = (key: "frequency" | "type" | "detune") => (e: Event) => {
        e.stopPropagation();
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
        engine()?.setAudioParams({ [key]: value });
        updateEngine(engine()!.id, { [key]: value }); // Trigger update
    };

    return (
        <div class={styles.oscillator}>
            <p>{engine()?.name}</p>
            <label>
                <input type="range" min="50" max="2000" value={engine()?.getFrequency()?.toString() ?? ""} onInput={handleChange("frequency")} />
                <WUTText variant="subheader">Frequency: {engine()?.getFrequency()}</WUTText>
            </label>
            <label>
                <input type="range" min="-1200" max="1200" value={engine()?.getDetune()?.toString() ?? ""} onInput={handleChange("detune")} />
                <WUTText variant="subheader">Detune: {engine()?.getDetune()}</WUTText>
            </label>
            <label>
                Type:
                <select value={engine()?.getType()} onChange={handleChange("type")}>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>
        </div>
    );
}
