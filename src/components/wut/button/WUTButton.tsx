import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import styles from "./wut-button.module.scss";

type WUTButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant: "primary" | "secondary" | "destructive";
};

export function WUTButton(props: WUTButtonProps) {
    const [local, rest] = splitProps(props, ["variant", "class", "children"]);

    const buttonClass = `${styles.wutButton} ${styles[local.variant ?? "primary"]}${local.class ? ` ${local.class}` : ""}`;

    return (
        <button class={buttonClass} {...rest}>
            {local.children}
        </button>
    );
}
