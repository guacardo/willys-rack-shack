import { createMemo } from "solid-js";
import { isGainEngine } from "@/audio/gain.engine";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { Snappable } from "@/components/ui/snappable/snappable";
import { WAKGain } from "@/components/wak/gain/WAK.Gain";
import { WAKOscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { WUTText } from "@/components/wut/text/WUT.Text";
import { getEngineById } from "@/stores/engines.store";
import { getGroup, getMembersOfGroup } from "@/stores/groups.store";
import { isSelected, selectItem } from "@/stores/selection.store";
import type { ViewportProps } from "../viewport";
import styles from "./engine-module.module.scss";

export function ViewportEngineModule(props: { id: string; viewport: ViewportProps }) {
    const group = createMemo(() => getGroup(props.id));
    const members = createMemo(() => getMembersOfGroup(group()!.id).map(getEngineById));

    // Find the first gain engine
    const firstGain = createMemo(() => members().find(isGainEngine));
    // All other engines except the first gain
    const otherEngines = createMemo(() => members().filter((engine) => !isGainEngine(engine) || engine.id !== firstGain()?.id));

    return (
        <Snappable
            id={props.id}
            initial={props.viewport.initialPan ?? { x: 100, y: 100 }}
            getScale={props.viewport.getScale}
            isSpaceHeld={props.viewport.isSpaceHeld}
            borderColor={isSelected("group", props.id) ? "#4f8cff" : undefined}
            onClick={() => selectItem("group", props.id)}
        >
            <div class={styles.groupGrid}>
                <div class={styles.mainContent}>
                    <WUTText variant="header" flare={{ dotted: true }}>
                        {group()!.name}
                    </WUTText>
                    {otherEngines().map((engine) => {
                        if (isOscillatorEngine(engine)) {
                            return <WAKOscillator id={engine.id} />;
                        } else if (isGainEngine(engine)) {
                            return <WAKGain id={engine.id} />;
                        }
                        return null;
                    })}
                </div>
                {firstGain() && (
                    <div class={styles.gainSidebar}>
                        <WAKGain id={firstGain()!.id} orientation="vertical" />
                    </div>
                )}
            </div>
        </Snappable>
    );
}
