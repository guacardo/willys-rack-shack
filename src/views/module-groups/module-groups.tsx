import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./module-groups.module.scss";
import type { IAudioEngine } from "@/audio/engine";

interface ModuleGroupProps {
    expanded: boolean;
    modules: IAudioEngine[];
    setModules: (modules: IAudioEngine[]) => void;
    currentModule: IAudioEngine | null;
    setCurrentModule: (module: IAudioEngine) => void;
}

export function ModuleGroups(props: ModuleGroupProps) {
    return (
        <div class={`${styles["module-groups"]} ${props.expanded ? styles.visible : ""}`}>
            <WUTText variant="header">Module Groups</WUTText>
            {props.modules.map((module) => (
                <div class={`${styles["module-item"]} ${props.currentModule === module ? styles.selected : ""}`} onClick={() => props.setCurrentModule(module)}>
                    {module.name}
                </div>
            ))}
        </div>
    );
}
