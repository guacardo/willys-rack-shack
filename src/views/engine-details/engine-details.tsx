import { WUTText } from "@/components/wut/text/WUT.Text";
import { getEngineById, updateEngine } from "@/stores/engines.store";
import styles from "./engine-details.module.scss";
import { WAKOscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { WAKGain } from "@/components/wak/gain/WAK.Gain";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { selection } from "@/stores/selection.store";
import { createMemo, Show } from "solid-js";

export function EngineDetails() {
    const engine = createMemo(() => (selection() ? getEngineById(selection()!.id) : null));

    return (
        <div class={styles["engine-details"]}>
            <WUTText variant="header" flare={{ dotted: true }}>
                Module Details
            </WUTText>
            <Show when={engine()} keyed>
                {(eng) => (
                    <div>
                        <input type="text" value={eng.name} onInput={(e: InputEvent) => updateEngine(eng.id, { name: (e.target as HTMLInputElement).value })} />
                        {isOscillatorEngine(eng) && <WAKOscillator id={eng.id} />}
                        {eng.engineType === "gain" && <WAKGain id={eng.id} />}
                    </div>
                )}
            </Show>
            <Show when={!engine()}>
                <div class={styles["empty-state"]}>
                    <WUTText variant="body">No module selected</WUTText>
                </div>
            </Show>
        </div>
    );
}
