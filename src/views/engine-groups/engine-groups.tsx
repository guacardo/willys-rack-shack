import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./engine-groups.module.scss";
import { EngineType } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, getAllEngines } from "@/stores/engines.store";
import { useWebAudioContext } from "@/contexts/web-audio-context";
import { createGroup, getAllGroups, addMember } from "@/stores/groups.store";

interface EngineGroupProps {
    expanded: boolean;
    currentEngineId: string | null;
    setCurrentEngine: (engineId: string | null) => void;
}

const nodeSelectOptions = Object.entries(EngineType).map(([key, value]) => ({
    label: key,
    value: value,
}));

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
            <WUTText variant="header">Module Groups</WUTText>
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
                        const engine = getAllEngines().find((e) => e.id === memberId);
                        return engine ? <WUTText variant="body">- {engine.name}</WUTText> : null;
                    })}
                </div>
            ))}
            <WUTText variant="header">Engines</WUTText>
            {getAllEngines().map((engine) => (
                <div
                    class={`${styles["engine-item"]} ${props.currentEngineId === engine.id ? styles.selected : ""}`}
                    onClick={() => props.setCurrentEngine(engine.id)}
                >
                    {engine.name}
                    <select
                        onChange={(e) => {
                            const groupId = e.target.value;
                            addMember(groupId, engine.id);
                        }}
                    >
                        <option value="" disabled>
                            Add to group...
                        </option>
                        {getAllGroups().map((group) => (
                            <option value={group.id}>{group.name}</option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
}
