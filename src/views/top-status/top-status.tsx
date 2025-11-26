import { useWebAudioContext } from "@/contexts/web-audio-context";
import styles from "./top-status.module.scss";

export function TopStatus() {
    const { state, resume } = useWebAudioContext();

    return (
        <div class={styles["top-status"]}>
            <button onClick={resume} disabled={state() === "running"}>
                Play
            </button>
            <span>AudioContext status: {state()}</span>
        </div>
    );
}
