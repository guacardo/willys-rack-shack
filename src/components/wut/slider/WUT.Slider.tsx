import { createSignal, onMount, onCleanup } from "solid-js";
import styles from "./wut-slider.module.scss";

interface WUTSliderProps {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    orientation?: "horizontal" | "vertical";
    onInput?: (value: number) => void;
    onChange?: (value: number) => void;
    class?: string;
}

export function WUTSlider(props: WUTSliderProps) {
    const min = () => props.min ?? 0;
    const max = () => props.max ?? 100;
    const step = () => props.step ?? 1;
    const orientation = () => props.orientation ?? "horizontal";

    let trackRef: HTMLDivElement | undefined;
    let thumbRef: HTMLDivElement | undefined;

    const [isDragging, setIsDragging] = createSignal(false);
    const [internalValue, setInternalValue] = createSignal(props.value ?? min());

    const value = () => props.value ?? internalValue();

    // Calculate percentage for positioning
    const percentage = () => {
        const range = max() - min();
        const val = Math.max(min(), Math.min(max(), value()));
        return ((val - min()) / range) * 100;
    };

    // Snap value to step
    const snapToStep = (val: number): number => {
        const stepValue = step();
        const snapped = Math.round((val - min()) / stepValue) * stepValue + min();
        return Math.max(min(), Math.min(max(), snapped));
    };

    // Get value from mouse/touch position
    const getValueFromPosition = (clientX: number, clientY: number): number => {
        if (!trackRef) return value();

        const rect = trackRef.getBoundingClientRect();
        const isVertical = orientation() === "vertical";

        let ratio: number;
        if (isVertical) {
            // For vertical, top = max, bottom = min
            ratio = 1 - (clientY - rect.top) / rect.height;
        } else {
            ratio = (clientX - rect.left) / rect.width;
        }

        ratio = Math.max(0, Math.min(1, ratio));
        const rawValue = min() + ratio * (max() - min());
        return snapToStep(rawValue);
    };

    const updateValue = (newValue: number) => {
        setInternalValue(newValue);
        props.onInput?.(newValue);
    };

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const newValue = getValueFromPosition(e.clientX, e.clientY);
        updateValue(newValue);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging()) return;
        e.stopPropagation();
        const newValue = getValueFromPosition(e.clientX, e.clientY);
        updateValue(newValue);
    };

    const handleMouseUp = () => {
        if (isDragging()) {
            setIsDragging(false);
            props.onChange?.(value());
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        let newValue = value();
        const stepValue = step();

        switch (e.key) {
            case "ArrowUp":
            case "ArrowRight":
                e.preventDefault();
                newValue = snapToStep(value() + stepValue);
                break;
            case "ArrowDown":
            case "ArrowLeft":
                e.preventDefault();
                newValue = snapToStep(value() - stepValue);
                break;
            case "Home":
                e.preventDefault();
                newValue = min();
                break;
            case "End":
                e.preventDefault();
                newValue = max();
                break;
            default:
                return;
        }

        updateValue(newValue);
        props.onChange?.(newValue);
    };

    onMount(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    });

    onCleanup(() => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    });

    return (
        <div
            ref={trackRef}
            class={`${styles["slider"]} ${styles[orientation()]} ${props.class || ""}`}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuemin={min()}
            aria-valuemax={max()}
            aria-valuenow={value()}
            aria-orientation={orientation()}
        >
            <div class={styles["track"]}>
                <div
                    class={styles["fill"]}
                    style={{
                        [orientation() === "vertical" ? "height" : "width"]: `${percentage()}%`,
                    }}
                />
            </div>
            <div
                ref={thumbRef}
                class={styles["thumb"]}
                style={{
                    [orientation() === "vertical" ? "bottom" : "left"]: `${percentage()}%`,
                }}
            />
        </div>
    );
}
