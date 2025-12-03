import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./engine-groups.module.scss";
import { EngineType } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, getEngineById, getUngroupedEngines } from "@/stores/engines.store";
import { useWebAudioContext } from "@/contexts/web-audio-context";
import { createGroup, getAllGroups, addMember, removeMember, getMembersOfGroup, setGroupName } from "@/stores/groups.store";
import { isSelected, selectItem } from "@/stores/selection.store";

interface EngineGroupProps {
    expanded: boolean;
}

const nodeSelectOptions = Object.entries(EngineType).map(([key, value]) => ({
    label: key,
    value: value,
}));

function GroupedEngineItem(props: { engineId: string; groupId: string; onClick?: () => void; selected: boolean }) {
    return (
        <div class={`${styles["grouped-engine-item"]} ${props.selected ? styles.selected : ""}`} onClick={props.onClick}>
            <WUTText variant="body">{getEngineById(props.engineId)?.name}</WUTText>
            <button
                onClick={() => {
                    console.log("removeing member", props.engineId, "from group", props.groupId);
                    removeMember(props.groupId, props.engineId);
                }}
            >
                -
            </button>
        </div>
    );
}

function UngroupedEngineItem(props: { engineId: string; onClick?: () => void; selected: boolean }) {
    const [selectedGroupId, setSelectedGroupId] = createSignal<string>("");

    return (
        <div class={`${styles["engine-item"]} ${props.selected ? styles.selected : ""}`} onClick={props.onClick}>
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
            <WUTText variant="header" flare={{ dotted: true }}>
                Modules
            </WUTText>
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
                    <WUTText
                        variant="subheader"
                        contentEditable
                        onBlur={(e) => {
                            const newName = e.target.textContent?.trim() || group.name;
                            if (newName !== group.name) {
                                setGroupName(group.id, newName);
                            }
                        }}
                    >
                        {group.name}
                    </WUTText>
                    <WUTText variant="body">Members: {group.members.length}</WUTText>
                    {getMembersOfGroup(group.id).map((memberId) => {
                        return (
                            <GroupedEngineItem
                                engineId={memberId}
                                groupId={group.id}
                                selected={isSelected("engine", memberId)}
                                onClick={() => selectItem("engine", memberId)}
                            />
                        );
                    })}
                </div>
            ))}
            <WUTText variant="header">Engines</WUTText>
            {getUngroupedEngines().map((engine) => (
                <UngroupedEngineItem engineId={engine.id} selected={isSelected("engine", engine.id)} onClick={() => selectItem("engine", engine.id)} />
            ))}
        </div>
    );
}
