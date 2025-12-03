import { createMemo } from "solid-js";
import { WUTInput } from "@/components/wut/input/WUT.Input";
import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./WAK.Gain.module.scss";
import { getEngineById } from "@/stores/engines.store";
import { isGainEngine } from "@/audio/gain.engine";

export interface WAKGainProps {
    id: string;
}

export function WAKGain({ id }: WAKGainProps) {
    const engine = createMemo(() => {
        const eng = getEngineById(id);
        return isGainEngine(eng) ? eng : undefined;
    });

    const handleGainChange = (e: Event) => {
        const value = Number((e.target as HTMLInputElement).value);
        engine()?.setAudioParams({ gain: value });
    };

    return (
        <div class={styles.gain}>
            <WUTText variant="label">Gain</WUTText>
            <WUTInput type="range" min="0" max="2" step="0.01" value={engine()?.getGain().toString()} onInput={handleGainChange} />
            <WUTText variant="number">{engine()?.getGain().toFixed(2)}</WUTText>
        </div>
    );
}
