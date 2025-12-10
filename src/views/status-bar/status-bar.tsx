import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./status-bar.module.scss";
import { WUTButton } from "@/components/wut/button/WUTButton";
import { getAudioContextState, resumeAudioContext } from "@/stores/web-audio-context.store";

interface StatusBarProps {
    theme: "light" | "dark" | "neon-green" | "synthwave";
    setTheme: (theme: "light" | "dark" | "neon-green" | "synthwave") => void;
}

export function StatusBar(props: StatusBarProps) {
    return (
        <div class={styles["status-bar"]}>
            <WUTButton variant="primary" onClick={resumeAudioContext} disabled={getAudioContextState() === "running"}>
                Play
            </WUTButton>
            <WUTText variant="body">AudioContext status: {getAudioContextState()}</WUTText>

            <select value={props.theme} onChange={(e) => props.setTheme(e.target.value as any)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="neon-green">Neon Green</option>
                <option value="synthwave">Synthwave</option>
            </select>
        </div>
    );
}
