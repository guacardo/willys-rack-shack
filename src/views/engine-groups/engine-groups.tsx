import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./engine-groups.module.scss";
import { EngineType, type EngineTypeValue } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, getEngineById, getUngroupedEngines, removeEngine } from "@/stores/engines.store";
import { getAllGroups, addMember, removeMember, getMembersOfGroup, setGroupName, groupTemplateOptions, createGroupFromTemplate } from "@/stores/groups.store";
import { isSelected, selectItem } from "@/stores/selection.store";
import { WUTButton } from "@/components/wut/button/WUTButton";
import { getAudioContext } from "@/stores/web-audio-context.store";

interface EngineGroupProps {
    expanded: boolean;
}

const nodeSelectOptions = Object.entries(EngineType).map(([key, value]) => ({
    label: value,
    value: key,
}));

function GroupedEngineItem(props: { engineId: string; groupId: string; onClick?: () => void; selected: boolean }) {
    return (
        <div class={`${styles["grouped-engine-item"]} ${props.selected ? styles.selected : ""}`} onClick={props.onClick}>
            <WUTText variant="body">{getEngineById(props.engineId)?.name}</WUTText>
            <button
                onClick={() => {
                    console.log("removing member", props.engineId, "from group", props.groupId);
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

export function EngineGroups(props: EngineGroupProps) {
    const audioCtx = getAudioContext();
    const [selectedEngine, setSelectedEngine] = createSignal(nodeSelectOptions[0].value);
    const [selectedTemplate, setSelectedTemplate] = createSignal<keyof typeof groupTemplateOptions>("empty");

    function handleCreateNode() {
        let newNode;
        if (selectedEngine() === "oscillator") newNode = new OscillatorEngine(audioCtx);
        if (selectedEngine() === "gain") newNode = new GainEngine(audioCtx);
        if (newNode) addEngine(newNode);
    }

    return (
        <div class={`${styles["engine-groups"]} ${props.expanded ? styles.visible : ""}`}>
            <div class={styles["section-header"]}>
                <WUTText variant="header" flare={{ dotted: true }}>
                    Groups
                </WUTText>
                <select value={selectedTemplate()} onChange={(e) => setSelectedTemplate(e.target.value as keyof typeof groupTemplateOptions)}>
                    {Object.entries(groupTemplateOptions).map(([key, label]) => (
                        <option value={key}>{label}</option>
                    ))}
                </select>
                <button
                    onClick={() => {
                        createGroupFromTemplate(selectedTemplate(), audioCtx);
                    }}
                >
                    +
                </button>
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
                    <WUTText variant="body" flare={{ dotted: true }}>
                        Members: {group.members.length}
                    </WUTText>
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
            <div class={styles["section-header"]}>
                <WUTText variant="header" flare={{ dotted: true }}>
                    Engines
                </WUTText>
                <select value={selectedEngine()} onChange={(e) => setSelectedEngine(e.target.value as EngineTypeValue)}>
                    {nodeSelectOptions.map((option) => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </select>
                <button onClick={handleCreateNode}>+</button>
            </div>
            {getUngroupedEngines().map((engine) => (
                <UngroupedEngineItem engineId={engine.id} selected={isSelected("engine", engine.id)} onClick={() => selectItem("engine", engine.id)} />
            ))}
        </div>
    );
}
