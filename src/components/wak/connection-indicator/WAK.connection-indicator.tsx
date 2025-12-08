import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./WAK.connection-indicator.module.scss";

interface WAKConnectionIndicatorProps {
    label: string;
    status: "on" | "off" | "who-knows" | "error";
}

export function WAKConnectionIndicator({ label, status }: WAKConnectionIndicatorProps) {
    return (
        <div class={styles["wak-connection-indicator"]}>
            <div class={`${styles["indicator"]} ${styles[status]}`}></div>
            <WUTText variant="label">{label}</WUTText>
        </div>
    );
}
