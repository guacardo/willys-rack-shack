import { createSignal, onCleanup } from "solid-js";
import { GainEngine } from "@/audio/gain.engine";
import { WUTInput } from "@/components/wut/input/WUT.Input";
import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./WAK.Gain.module.scss";

export interface WAKGainProps {
    engine: GainEngine;
}

export function Gain({ engine }: WAKGainProps) {
    const [gain, setGain] = createSignal(engine.getGain());

    // Poll actual gain value (for modulation)
    const [actualGain, setActualGain] = createSignal(engine.getGain());
    const poller = setInterval(() => setActualGain(engine.getGain()), 30);
    onCleanup(() => clearInterval(poller));

    const handleGainChange = (e: Event) => {
        const value = +(e.target as HTMLInputElement).value;
        setGain(value);
        engine.setGain(value);
    };

    return (
        <div class={styles.gain}>
            <WUTText variant="label">Gain</WUTText>
            <WUTInput type="range" min="0" max="2" step="0.01" value={gain().toString()} onInput={handleGainChange} />
            <WUTText variant="number">Actual Gain: {actualGain().toFixed(2)}</WUTText>
        </div>
    );
}
