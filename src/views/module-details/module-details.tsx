import type { IAudioEngine } from "@/audio/engine";
import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./module-details.module.scss";

interface ModuleDetailsProps {
    module: IAudioEngine | null;
}

export function ModuleDetails(props: ModuleDetailsProps) {
    return (
        <div class={styles["module-details"]}>
            <WUTText variant="header">Module Details</WUTText>
            {props.module ? (
                <div>
                    <WUTText variant="body">Module ID: {props.module.ctx.baseLatency}</WUTText>
                </div>
            ) : (
                <WUTText variant="body">No module selected</WUTText>
            )}
        </div>
    );
}
