import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import styles from "./wut-input.module.scss";

type WUTInputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
    class?: string;
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
    onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
};

export function WUTInput(props: WUTInputProps) {
    const [local, rest] = splitProps(props, ["type", "value", "placeholder", "error", "class", "onInput", "onFocus", "onBlur"]);
    let inputClass = styles.wutInput;
    if (local.error) inputClass += ` ${styles.error}`;
    return (
        <input
            type={local.type ?? "text"}
            value={local.value}
            placeholder={local.placeholder}
            class={`${inputClass}${local.class ? ` ${local.class}` : ""}`}
            onInput={local.onInput}
            onFocus={local.onFocus}
            onBlur={local.onBlur}
            {...rest}
        />
    );
}
