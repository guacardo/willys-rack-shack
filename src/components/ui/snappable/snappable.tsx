import { createSignal, onCleanup, type JSX } from "solid-js";
import { Draggable } from "@/components/ui/draggable/draggable";
import type { IAudioEngine } from "@/audio/engine";
import { registerSnapTarget, unregisterSnapTarget } from "@/stores/snap.store";

interface SnappableProps {
    key?: string;
    initial: { x: number; y: number };
    getScale?: () => number;
    isSpaceHeld?: boolean;
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
                console.log("Snapped!", engine.name);
            },
        });
    }

    function handleDragEnd(newPos: { x: number; y: number }) {
        setPosition(newPos);
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
