import type { JSX } from "solid-js";
import styles from "./wut-text.module.scss";

type WUTTextVariant = "header" | "subheader" | "body" | "number" | "label";

interface WUTTextProps {
    children: JSX.Element;
    variant: WUTTextVariant;
    class?: string;
}

const variantStyles: Record<WUTTextVariant, string> = {
    header: styles["wut-header"],
    subheader: styles["wut-subheader"],
    body: styles["wut-body"],
    number: styles["wut-number"],
    label: styles["wut-label"],
};

export function WUTText(props: WUTTextProps) {
    const variantClass = props.variant ? variantStyles[props.variant] : variantStyles.body;
    return <span class={`${variantClass}${props.class ? ` ${props.class}` : ""}`}>{props.children}</span>;
}
