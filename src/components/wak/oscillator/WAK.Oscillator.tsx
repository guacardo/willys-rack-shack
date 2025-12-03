import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { getEngineById } from "@/stores/engines.store";
import { createMemo, createSignal, createEffect, onCleanup } from "solid-js";

export interface WAKOscillatorProps {
    id: string;
}

export function WAKOscillator({ id }: WAKOscillatorProps) {
    const engine = createMemo(() => {
        const eng = getEngineById(id);
        return isOscillatorEngine(eng) ? eng : undefined;
    });

    // Local signals for display values
    const [frequency, setFrequency] = createSignal(engine()?.getFrequency() ?? 440);
    const [detune, setDetune] = createSignal(engine()?.getDetune() ?? 0);
    const [type, setType] = createSignal(engine()?.getType() ?? "sine");

    // Poll the engine for current values
    let poller: number | undefined;
    createEffect(() => {
        if (poller) clearInterval(poller);

        const eng = engine();
        if (eng) {
            poller = setInterval(() => {
                setFrequency(eng.getFrequency());
                setDetune(eng.getDetune());
                setType(eng.getType());
            }, 30); // ~30fps
        }

        onCleanup(() => poller && clearInterval(poller));
    });

    const handleFrequencyChange = (e: Event) => {
        e.stopPropagation();
        const value = Number((e.target as HTMLInputElement).value);
        // Just update audio params - poller will sync the UI
        engine()?.setAudioParams({ frequency: value });
    };

    const handleDetuneChange = (e: Event) => {
        e.stopPropagation();
        const value = Number((e.target as HTMLInputElement).value);
        engine()?.setAudioParams({ detune: value });
    };

    const handleTypeChange = (e: Event) => {
        e.stopPropagation();
        const value = (e.target as HTMLSelectElement).value as OscillatorType;
        engine()?.setAudioParams({ type: value });
    };

    return (
        <div class={styles.oscillator}>
            <p>{engine()?.name}</p>
            <label>
                <input type="range" min="50" max="2000" value={frequency()} onInput={handleFrequencyChange} />
                <WUTText variant="subheader">Frequency: {frequency()}</WUTText>
            </label>
            <label>
                <input type="range" min="-1200" max="1200" value={detune()} onInput={handleDetuneChange} />
                <WUTText variant="subheader">Detune: {detune()}</WUTText>
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
