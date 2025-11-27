import { createSignal, onCleanup, type JSX } from "solid-js";
import { Draggable } from "@/components/ui/draggable/draggable";
import type { IAudioEngine } from "@/audio/engine";
import { registerSnapTarget, unregisterSnapTarget } from "@/stores/snap.store";

type SnapTarget = {
    x: number;
    y: number;
    radius: number;
    onSnap: () => void;
};

interface SnappableProps {
    initial: { x: number; y: number };
    getScale?: () => number;
    isSpaceHeld?: boolean;
    snapTargets: SnapTarget[];
    render: (props: { onEngineReady: (engine: IAudioEngine) => void }) => JSX.Element;
}

export function Snappable(props: SnappableProps) {
    let snapId: string | undefined;
    const [position, setPosition] = createSignal(props.initial);

    function handleEngineReady(engine: IAudioEngine) {
        snapId = registerSnapTarget({
            x: position().x,
            y: position().y,
            radius: 40,
            engine,
            onSnap: () => {
                // Generic snap logic, engine-specific handled via typeguards later
            },
        });
    }

    function checkSnap(newPos: { x: number; y: number }) {
        for (const target of props.snapTargets) {
            const dx = newPos.x - target.x;
            const dy = newPos.y - target.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < target.radius) {
                setPosition({ x: target.x, y: target.y });
                target.onSnap();
                return true;
            }
        }
        return false;
    }

    function handleDragEnd(newPos: { x: number; y: number }) {
        if (!checkSnap(newPos)) {
            setPosition(newPos);
        }
    }

    onCleanup(() => {
        if (snapId) unregisterSnapTarget(snapId);
    });

    return (
        <Draggable initial={position()} getScale={props.getScale} isSpaceHeld={props.isSpaceHeld} onDragEnd={handleDragEnd}>
            {props.render({ onEngineReady: handleEngineReady })}
        </Draggable>
    );
}
