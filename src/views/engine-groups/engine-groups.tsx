import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./engine-groups.module.scss";
import { EngineType } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, getAllEngines, getEngineById } from "@/stores/engines.store";
import { useWebAudioContext } from "@/contexts/web-audio-context";
import { createGroup, getAllGroups, addMember, removeMember } from "@/stores/groups.store";

interface EngineGroupProps {
    expanded: boolean;
    currentEngineId: string | null;
    setCurrentEngine: (engineId: string | null) => void;
}

const nodeSelectOptions = Object.entries(EngineType).map(([key, value]) => ({
    label: key,
    value: value,
}));

function GroupedEngineItem(props: { engineId: string; groupId: string; setCurrentEngine: (engineId: string | null) => void; currentEngineId: string | null }) {
    // Call getEngineById directly in the JSX so it re-runs when the store updates
    return (
        <div
            class={`${styles["grouped-engine-item"]} ${props.currentEngineId === props.engineId ? styles.selected : ""}`}
            onClick={() => props.setCurrentEngine(props.engineId)}
        >
            <WUTText variant="body">{getEngineById(props.engineId)?.name}</WUTText>
            <button
                onClick={() => {
                    removeMember(props.groupId, props.engineId);
                }}
            >
                -
            </button>
        </div>
    );
}

function UngroupedEngineItem(props: { engineId: string; setCurrentEngine: (engineId: string | null) => void; currentEngineId: string | null }) {
    const [selectedGroupId, setSelectedGroupId] = createSignal<string>("");

    return (
        <div
            class={`${styles["engine-item"]} ${props.currentEngineId === props.engineId ? styles.selected : ""}`}
            onClick={() => props.setCurrentEngine(props.engineId)}
        >
            {getEngineById(props.engineId)?.name}
            <select value={selectedGroupId()} onChange={(e) => setSelectedGroupId(e.target.value)}>
                <option value="" disabled>
                    Add to group...
                </option>
                {getAllGroups().map((group) => (
                    <option value={group.id}>{group.name}</option>
                ))}
            </select>
            <button
                onClick={() => {
                    if (selectedGroupId()) {
                        addMember(selectedGroupId(), props.engineId);
                        setSelectedGroupId(""); // Optionally reset after adding
                    }
                }}
                disabled={!selectedGroupId()}
            >
                +
            </button>
        </div>
    );
}

export function EngineGroups(props: EngineGroupProps) {
    const { audioCtx } = useWebAudioContext();
    const [selectedType, setSelectedType] = createSignal(nodeSelectOptions[0].value);

    function handleCreateNode() {
        let newNode;
        if (selectedType() === "oscillator") newNode = new OscillatorEngine(audioCtx);
        if (selectedType() === "gain") newNode = new GainEngine(audioCtx);
        if (newNode) addEngine(newNode);
    }

    function handleCreateGroup() {
        createGroup("New Group");
    }

    return (
        <div class={`${styles["engine-groups"]} ${props.expanded ? styles.visible : ""}`}>
            <WUTText variant="header">Modules</WUTText>
            <div>
                <select value={selectedType()} onChange={(e) => setSelectedType(e.target.value as EngineType)}>
                    {nodeSelectOptions.map((option) => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </select>
                <button onClick={handleCreateNode}>Create Node</button>
                <button onClick={handleCreateGroup}>Create Group</button>
            </div>
            {getAllGroups().map((group) => (
                <div class={styles["group-item"]}>
                    <WUTText variant="subheader">{group.name}</WUTText>
                    <WUTText variant="body">Members: {group.members.length}</WUTText>
                    {group.members.map((memberId) => {
                        return (
                            <GroupedEngineItem
                                engineId={memberId}
                                groupId={group.id}
                                setCurrentEngine={props.setCurrentEngine}
                                currentEngineId={props.currentEngineId}
                            />
                        );
                    })}
                </div>
            ))}
            <WUTText variant="header">Engines</WUTText>
            {(() => {
                // Collect all engine IDs that are members of any group
                const groupedEngineIds = new Set<string>();
                getAllGroups().forEach((group) => {
                    group.members.forEach((id) => groupedEngineIds.add(id));
                });
                // Filter out engines that are in any group
                return getAllEngines()
                    .filter((engine) => !groupedEngineIds.has(engine.id))
                    .map((engine) => (
                        <UngroupedEngineItem engineId={engine.id} setCurrentEngine={props.setCurrentEngine} currentEngineId={props.currentEngineId} />
                    ));
            })()}
        </div>
    );
}
