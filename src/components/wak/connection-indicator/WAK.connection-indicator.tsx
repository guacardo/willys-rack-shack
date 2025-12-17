import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./WAK.connection-indicator.module.scss";
import type { ConnectionStatus } from "@/stores/connections.store";

interface WAKConnectionIndicatorProps {
    label: string;
    status: ConnectionStatus;
    onClick?: () => void;
}

export function WAKConnectionIndicator({ label, status, onClick }: WAKConnectionIndicatorProps) {
    return (
        <div class={styles["wak-connection-indicator"]} onClick={onClick}>
            <div class={`${styles["indicator"]} ${styles[status]}`}></div>
            <WUTText variant="label">{label}</WUTText>
        </div>
    );
}
