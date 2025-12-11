import { WUTButton } from "@/components/wut/button/WUTButton";
import { WUTText } from "@/components/wut/text/WUT.Text";
import { getEngineById, removeEngine } from "@/stores/engines.store";
import { getAllGroups, addMember } from "@/stores/groups.store";
import { createSignal } from "solid-js";
import styles from "./engine-groups.module.scss";
import { removeEngineFromGroupWithConnections } from "@/audio/engine";

export function GroupedEngineItem(props: { engineId: string; groupId: string; onClick?: () => void; selected: boolean }) {
    return (
        <div class={`${styles["grouped-engine-item"]} ${props.selected ? styles.selected : ""}`} onClick={props.onClick}>
            <WUTText variant="body">{getEngineById(props.engineId)?.name}</WUTText>
            <WUTButton
                variant="secondary"
                onClick={() => {
                    removeEngineFromGroupWithConnections(props.groupId, props.engineId);
                }}
            >
                -
            </WUTButton>
        </div>
    );
}

export function UngroupedEngineItem(props: { engineId: string; onClick?: () => void; selected: boolean }) {
    const [selectedGroupId, setSelectedGroupId] = createSignal<string>("");

    return (
        <div class={`${styles["engine-item"]} ${props.selected ? styles.selected : ""}`} onClick={props.onClick}>
            <WUTText variant="body">{getEngineById(props.engineId)?.name}</WUTText>
            <select value={selectedGroupId()} onChange={(e) => setSelectedGroupId(e.target.value)}>
                <option value="" disabled>
                    Add to group...
                </option>
                {getAllGroups().map((group) => (
                    <option value={group.id}>{group.name}</option>
                ))}
            </select>
            <WUTButton
                variant="secondary"
                onClick={() => {
                    if (selectedGroupId()) {
                        addMember(selectedGroupId(), props.engineId);
                        setSelectedGroupId(""); // Optionally reset after adding
                    }
                }}
                disabled={!selectedGroupId()}
            >
                +
            </WUTButton>
            <WUTButton
                variant="destructive"
                onClick={() => {
                    removeEngine(props.engineId);
                }}
            >
                x
            </WUTButton>
        </div>
    );
}
