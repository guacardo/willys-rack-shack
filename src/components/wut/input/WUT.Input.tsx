import type { JSX } from "solid-js";
import styles from "./wut-input.module.scss";

type WUTInputProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
    class?: string;
    onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
    onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
    orientation?: "horizontal" | "vertical";
};

export function WUTInput(props: WUTInputProps = { orientation: "horizontal" }) {
    return (
        <input
            type={props.type ?? "text"}
            value={props.value}
            placeholder={props.placeholder}
            class={`${styles["wut-input"]} ${styles[props.orientation ?? "horizontal"]}`}
            onInput={props.onInput}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            {...props}
        />
    );
}
