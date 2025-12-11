import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./engine-groups.module.scss";
import { EngineType, type EngineTypeValue } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, getUngroupedEngines } from "@/stores/engines.store";
import { getAllGroups, getMembersOfGroup, setGroupName, groupTemplateOptions, createGroupFromTemplate } from "@/stores/groups.store";
import { isSelected, selectItem } from "@/stores/selection.store";
import { getAudioContext } from "@/stores/web-audio-context.store";
import { GroupedEngineItem, UngroupedEngineItem } from "./engine-items";
import { WUTButton } from "@/components/wut/button/WUTButton";

interface EngineGroupProps {
    expanded: boolean;
}

const nodeSelectOptions = Object.entries(EngineType).map(([key, value]) => ({
    label: value,
    value: key,
}));

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
                <WUTText variant="header">Groups</WUTText>
                <div class={styles["button-group"]}>
                    <select value={selectedTemplate()} onChange={(e) => setSelectedTemplate(e.target.value as keyof typeof groupTemplateOptions)}>
                        {Object.entries(groupTemplateOptions).map(([key, label]) => (
                            <option value={key}>{label}</option>
                        ))}
                    </select>
                    <WUTButton
                        variant="secondary"
                        onClick={() => {
                            createGroupFromTemplate(selectedTemplate(), audioCtx);
                        }}
                    >
                        +
                    </WUTButton>
                </div>
            </div>
            {getAllGroups().length > 0 ? (
                getAllGroups().map((group) => (
                    <div class={styles["group"]}>
                        <div class={styles["group-header"]}>
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
                            <WUTButton variant="secondary" onClick={() => selectItem("group", group.id)}>
                                ^
                            </WUTButton>
                        </div>
                        <div class={styles["group-item-list"]}>
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
                    </div>
                ))
            ) : (
                <div class={styles["empty-state"]}>
                    <WUTText variant="label">?</WUTText>
                </div>
            )}
            <div class={styles["section-header"]}>
                <WUTText variant="header">Engines</WUTText>
                <div class={styles["button-group"]}>
                    <select value={selectedEngine()} onChange={(e) => setSelectedEngine(e.target.value as EngineTypeValue)}>
                        {nodeSelectOptions.map((option) => (
                            <option value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <WUTButton variant="secondary" onClick={handleCreateNode}>
                        +
                    </WUTButton>
                </div>
            </div>
            {getUngroupedEngines().length > 0 ? (
                getUngroupedEngines().map((engine) => (
                    <UngroupedEngineItem engineId={engine.id} selected={isSelected("engine", engine.id)} onClick={() => selectItem("engine", engine.id)} />
                ))
            ) : (
                <div class={styles["empty-state"]}>
                    <WUTText variant="label">nothin</WUTText>
                </div>
            )}
        </div>
    );
}
