import styles from "./context-bar.module.scss";

interface ContextBarProps {
    visible: boolean;
    children?: any;
}
export function ContextBar(props: ContextBarProps) {
    return <div class={`${styles["context-bar"]} ${props.visible ? styles.visible : ""}`}>{props.children}</div>;
}
