import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./module-groups.module.scss";
import { ModuleType, type IAudioEngine } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, engines } from "@/stores/engines.store";
import { useWebAudioContext } from "@/contexts/web-audio-context";

interface ModuleGroupProps {
    expanded: boolean;
    currentModule: IAudioEngine | null;
    setCurrentModule: (module: IAudioEngine) => void;
}

const nodeSelectOptions = Object.entries(ModuleType).map(([key, value]) => ({
    label: key,
    value: value,
}));

export function ModuleGroups(props: ModuleGroupProps) {
    const { audioCtx } = useWebAudioContext();
    const [selectedType, setSelectedType] = createSignal(nodeSelectOptions[0].value);

    function handleCreateNode() {
        let newNode;
        if (selectedType() === "oscillator") newNode = new OscillatorEngine(audioCtx);
        if (selectedType() === "gain") newNode = new GainEngine(audioCtx);
        if (newNode) addEngine(newNode);
    }
    return (
        <div class={`${styles["module-groups"]} ${props.expanded ? styles.visible : ""}`}>
            <WUTText variant="header">Module Groups</WUTText>
            <div>
                <select value={selectedType()} onChange={(e) => setSelectedType(e.target.value as ModuleType)}>
                    {nodeSelectOptions.map((option) => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </select>
                <button onClick={handleCreateNode}>Create Node</button>
            </div>
            {engines().map((engine) => (
                <div class={`${styles["module-item"]} ${props.currentModule === engine ? styles.selected : ""}`} onClick={() => props.setCurrentModule(engine)}>
                    {engine.name}
                </div>
            ))}
        </div>
    );
}
