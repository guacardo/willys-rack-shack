import { WUTText } from "@/components/wut/text/WUT.Text";
import { WUTInput } from "@/components/wut/input/WUT.Input";
import { getEngineById, updateEngine } from "@/stores/engines.store";
import styles from "./engine-details.module.scss";
import { createMemo } from "solid-js";

interface EngineDetailsProps {
    id: string | null;
}

function OscillatorDetails() {
    return (
        <div>
            <WUTText variant="header">Oscillator Details</WUTText>
            {/* Oscillator specific details and controls go here */}
        </div>
    );
}

function GainDetails() {
    return (
        <div>
            <WUTText variant="header">Gain Details</WUTText>
            {/* Gain specific details and controls go here */}
        </div>
    );
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
                        onInput={(e: InputEvent) => updateEngine(engine()!.id, (engine) => ({ ...engine, name: (e.target as HTMLInputElement).value }))}
                    />
                    {engine()!.engineType === "oscillator" && <OscillatorDetails />}
                    {engine()!.engineType === "gain" && <GainDetails />}
                </div>
            ) : (
                <WUTText variant="body">No module selected</WUTText>
            )}
        </div>
    );
}
