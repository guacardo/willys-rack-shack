import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { WUTInput } from "@/components/wut/input/WUT.Input";
import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./WAK.Gain.module.scss";
import { getEngineById } from "@/stores/engines.store";
import { isGainEngine } from "@/audio/gain.engine";

export interface WAKGainProps {
    id: string;
    orientation?: "horizontal" | "vertical";
}

export function WAKGain({ id, orientation = "horizontal" }: WAKGainProps) {
    const engine = createMemo(() => {
        const eng = getEngineById(id);
        return isGainEngine(eng) ? eng : undefined;
    });

    const [gain, setGain] = createSignal(engine()?.getGain() ?? 1);

    let poller: number | undefined;
    createEffect(() => {
        if (poller) clearInterval(poller);

        const eng = engine();
        if (eng) {
            poller = setInterval(() => {
                setGain(eng.getGain());
            }, 30); // ~30fps
        }

        onCleanup(() => poller && clearInterval(poller));
    });

    const handleGainChange = (e: Event) => {
        const value = Number((e.target as HTMLInputElement).value);
        engine()?.setAudioParams({ gain: value });
    };

    return (
        <div class={`${styles["control"]} ${styles[orientation]}`}>
            <WUTText variant="label">Gain</WUTText>
            <WUTInput type="range" min="0" max="2" step="0.01" value={gain()} onInput={handleGainChange} />
            <WUTText variant="number">{gain().toFixed(2)}</WUTText>
        </div>
    );
}
