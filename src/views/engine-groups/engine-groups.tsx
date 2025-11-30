import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./engine-groups.module.scss";
import { EngineType, type IAudioEngine } from "@/audio/engine";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { createSignal } from "solid-js";
import { addEngine, getAllEngines } from "@/stores/engines.store";
import { useWebAudioContext } from "@/contexts/web-audio-context";

interface EngineGroupProps {
    expanded: boolean;
    currentEngine: IAudioEngine | null;
    setCurrentEngine: (engine: IAudioEngine) => void;
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
    return (
        <div class={`${styles["module-groups"]} ${props.expanded ? styles.visible : ""}`}>
            <WUTText variant="header">Module Groups</WUTText>
            <div>
                <select value={selectedType()} onChange={(e) => setSelectedType(e.target.value as EngineType)}>
                    {nodeSelectOptions.map((option) => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </select>
                <button onClick={handleCreateNode}>Create Node</button>
            </div>
            {getAllEngines().map((engine) => (
                <div class={`${styles["engine-item"]} ${props.currentEngine === engine ? styles.selected : ""}`} onClick={() => props.setCurrentEngine(engine)}>
                    {engine.name}
                </div>
            ))}
        </div>
    );
}
