import { createSignal, createEffect } from "solid-js";
import { Draggable } from "@/components/ui/draggable/draggable";
import { updatePosition, snappables, registerSnappable } from "@/stores/snappables.store";

interface SnappableProps {
    id: string;
    initial: { x: number; y: number };
    getScale?: () => number;
    isSpaceHeld?: boolean;
    children?: any;
}

export function Snappable(props: SnappableProps) {
    // Find existing position in store by id, or register if not present
    let initialPosition = props.initial;
    let existingSnap = snappables.find((t) => t.id === props.id);
    if (!existingSnap) {
        // Register snappable if not present
        registerSnappable({
            id: props.id,
            x: props.initial.x,
            y: props.initial.y,
            radius: 40,
            onSnap: () => {},
        });
        existingSnap = { id: props.id, x: props.initial.x, y: props.initial.y, radius: 40, onSnap: () => {} };
    }
    initialPosition = { x: existingSnap.x, y: existingSnap.y };
    const [position, setPosition] = createSignal(initialPosition);

    // Reactively update position from store
    createEffect(() => {
        const snap = snappables.find((t) => t.id === props.id);
        if (snap) setPosition({ x: snap.x, y: snap.y });
    });

    function handleDragEnd(newPos: { x: number; y: number }) {
        setPosition(newPos);
        updatePosition(props.id, newPos.x, newPos.y);
    }

    return (
        <Draggable initial={position()} getScale={props.getScale} isSpaceHeld={props.isSpaceHeld} onDragEnd={handleDragEnd}>
            {props.children}
        </Draggable>
    );
}
