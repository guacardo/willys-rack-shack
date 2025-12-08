import { WUTText } from "@/components/wut/text/WUT.Text";
import styles from "./connections.module.scss";
import { connections } from "@/stores/connections.store";
import { getEngineName } from "@/stores/engines.store";

interface ConnectionsProps {
    expanded: boolean;
    children?: any;
}

export function Connections(props: ConnectionsProps) {
    return (
        <div class={`${styles["connections-panel"]} ${props.expanded ? styles.visible : ""}`}>
            <WUTText variant="header">Connections</WUTText>
            {connections().map((conn) => (
                <div class={styles.connection}>
                    <WUTText variant="body">
                        {getEngineName(conn.from.id)} ({conn.from.type} - {conn.from.port}) → {getEngineName(conn.to.id)} ({conn.to.type} - {conn.to.port})
                    </WUTText>
                </div>
            ))}
        </div>
    );
}
