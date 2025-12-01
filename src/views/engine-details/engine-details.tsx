import { WUTText } from "@/components/wut/text/WUT.Text";
import { WUTInput } from "@/components/wut/input/WUT.Input";
import { getEngineById, updateEngine } from "@/stores/engines.store";
import styles from "./engine-details.module.scss";
import { createMemo } from "solid-js";
import { WAKOscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { WAKGain } from "@/components/wak/gain/WAK.Gain";
import type { GainEngine } from "@/audio/gain.engine";
import type { OscillatorEngine } from "@/audio/oscillator.engine";

interface EngineDetailsProps {
    id: string | null;
}

export function EngineDetails(props: EngineDetailsProps) {
    const engine = createMemo(() => (props.id ? getEngineById(props.id) : null));

    return (
        <div class={styles["engine-details"]}>
            <WUTText variant="header">Module Details</WUTText>
            {engine() ? (
                <div>
                    <WUTText variant="body">Module ID: {engine()!.id}</WUTText>
                    <WUTInput
                        type="text"
                        value={engine()!.name}
                        onInput={(e: InputEvent) => updateEngine(engine()!.id, { name: (e.target as HTMLInputElement).value })}
                    />
                    {engine()!.engineType === "oscillator" && <WAKOscillator engine={engine()! as OscillatorEngine} />}
                    {engine()!.engineType === "gain" && <WAKGain engine={engine()! as GainEngine} />}
                </div>
            ) : (
                <WUTText variant="body">No module selected</WUTText>
            )}
        </div>
    );
}
