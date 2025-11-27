import { useWebAudioContext } from "@/contexts/web-audio-context";
import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./top-status.module.scss";
import { WUTButton } from "@/components/wut/button/WUTButton";

interface TopStatusProps {
    theme: "light" | "dark" | "neon-green" | "synthwave";
    setTheme: (theme: "light" | "dark" | "neon-green" | "synthwave") => void;
}

export function TopStatus(props: TopStatusProps) {
    const { state, resume } = useWebAudioContext();

    return (
        <div class={styles["top-status"]}>
            <WUTButton variant="primary" onClick={resume} disabled={state() === "running"}>
                Play
            </WUTButton>
            <WUTText variant="body">AudioContext status: {state()}</WUTText>

            <select value={props.theme} onChange={(e) => props.setTheme(e.target.value as any)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="neon-green">Neon Green</option>
                <option value="synthwave">Synthwave</option>
            </select>
        </div>
    );
}
