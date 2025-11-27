import { createSignal, type JSX } from "solid-js";
import styles from "./draggable.module.scss";

interface DraggableProps {
    initial: { x: number; y: number };
    getScale?: () => number;
    isSpaceHeld?: boolean;
    children: JSX.Element;
}

export function Draggable(props: DraggableProps) {
    const [pos, setPos] = createSignal(props.initial);

    const onMouseDown = (e: MouseEvent) => {
        // Don't drag if space is held
        // Don't drag if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (props.isSpaceHeld || target.matches("input, select, button, textarea, a")) {
            return;
        }

        // handle drag events
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const origPos = pos();
        const scale = props.getScale ? props.getScale() : 1;

        const onMouseMove = (moveEvent: MouseEvent) => {
            setPos({
                x: origPos.x + (moveEvent.clientX - startX) / scale,
                y: origPos.y + (moveEvent.clientY - startY) / scale,
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", () => window.removeEventListener("mousemove", onMouseMove), { once: true });
    };

    return (
        <div
            class={styles.draggable}
            style={{
                left: `${pos().x}px`,
                top: `${pos().y}px`,
            }}
            onMouseDown={onMouseDown}
        >
            {props.children}
        </div>
    );
}
