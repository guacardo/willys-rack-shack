import { WUTText } from "@/components/wut/text/WUT.Text";
import { WUTInput } from "@/components/wut/input/WUT.Input";
import { getEngineById, updateEngine } from "@/stores/engines.store";
import styles from "./engine-details.module.scss";

interface EngineDetailsProps {
    id?: string;
}

export function EngineDetails(props: EngineDetailsProps) {
    const engine = props.id ? getEngineById(props.id) : null;
    return (
        <div class={styles["engine-details"]}>
            <WUTText variant="header">Module Details</WUTText>
            {engine ? (
                <div>
                    <WUTText variant="body">Module ID: {engine.id}</WUTText>
                    <WUTInput
                        type="text"
                        value={engine.name}
                        onInput={(e: InputEvent) => updateEngine(engine.id, (engine) => ({ ...engine, name: (e.target as HTMLInputElement).value }))}
                    />
                </div>
            ) : (
                <WUTText variant="body">No module selected</WUTText>
            )}
        </div>
    );
}
