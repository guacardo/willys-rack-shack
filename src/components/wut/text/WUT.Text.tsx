import type { JSX } from "solid-js";
import styles from "./wut-text.module.scss";

type WUTTextVariant = "header" | "subheader" | "body" | "number" | "label" | "unit";

interface WUTTextProps {
    children: JSX.Element;
    variant: WUTTextVariant;
    class?: string;
    contentEditable?: boolean;
    onBlur?: JSX.EventHandlerUnion<HTMLSpanElement, FocusEvent>;
    flare?: {
        dotted?: boolean;
    };
}

const variantStyles: Record<WUTTextVariant, string> = {
    header: styles["wut-header"],
    subheader: styles["wut-subheader"],
    body: styles["wut-body"],
    number: styles["wut-number"],
    label: styles["wut-label"],
    unit: styles["wut-unit"],
};

export function WUTText(props: WUTTextProps) {
    const variantClass = props.variant ? variantStyles[props.variant] : variantStyles.body;
    const flareClass = props.flare?.dotted ? "wut-flare-dotted" : "";
    console.log("flareClass", flareClass);
    return (
        <span class={`${variantClass} ${styles[flareClass]}`} contentEditable={props.contentEditable} onBlur={props.onBlur}>
            {props.children}
        </span>
    );
}
