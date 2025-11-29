import type { JSX } from "solid-js";
import styles from "./wut-input.module.scss";

type WUTInputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
    class?: string;
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
    onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
};

export function WUTInput(props: WUTInputProps) {
    let inputClass = styles.wutInput;
    if (props.error) inputClass += ` ${styles.error}`;
    return (
        <input
            type={props.type ?? "text"}
            value={props.value}
            placeholder={props.placeholder}
            class={`${inputClass}${props.class ? ` ${props.class}` : ""}`}
            onInput={props.onInput}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            {...props}
        />
    );
}
