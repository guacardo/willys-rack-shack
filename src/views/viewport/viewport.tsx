import { createSignal, onCleanup } from "solid-js";
import { WAKOscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { WAKGain } from "@/components/wak/gain/WAK.Gain";
import { Snappable } from "@/components/ui/snappable/snappable";
import { getEngineById, getUngroupedEngines } from "@/stores/engines.store";
import { isGainEngine } from "@/audio/gain.engine";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { selectItem, isSelected, type SelectionType } from "@/stores/selection.store";

import styles from "./viewport.module.scss";
import { getAllGroups, getMembersOfGroup } from "@/stores/groups.store";

interface ViewportProps {
    setIsSpaceHeld: (held: boolean) => void;
    isSpaceHeld: boolean;
    setIsGrabbing: (grabbing: boolean) => void;
}

export function Viewport(props: ViewportProps) {
    const [pan, setPan] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });
    const [scale, setScale] = createSignal<number>(1);

    // Listen for spacebar keydown/keyup globally
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space") props.setIsSpaceHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") props.setIsSpaceHeld(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    onCleanup(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
    });

    // Pan logic (global mousedown listener)
    const onViewportMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!props.isSpaceHeld) return;

        props.setIsGrabbing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const origPan = pan();

        const onMouseMove = (moveEvent: MouseEvent) => {
            setPan({
                x: origPan.x + (moveEvent.clientX - startX),
                y: origPan.y + (moveEvent.clientY - startY),
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener(
            "mouseup",
            () => {
                window.removeEventListener("mousemove", onMouseMove);
                props.setIsGrabbing(false);
            },
            { once: true }
        );
    };

    window.addEventListener("mousedown", onViewportMouseDown);
    onCleanup(() => {
        window.removeEventListener("mousedown", onViewportMouseDown);
    });

    // Zoom logic (global wheel listener, zoom from mouse position)
    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 0.1;
        const oldScale = scale();
        let newScale = oldScale;

        if (e.deltaY < 0) {
            newScale = Math.min(oldScale + zoomFactor, 4);
        } else {
            newScale = Math.max(oldScale - zoomFactor, 0.2);
        }

        // Mouse position relative to the viewport
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate the world position under the mouse before scaling
        const worldX = (mouseX - pan().x) / oldScale;
        const worldY = (mouseY - pan().y) / oldScale;

        // After scaling, calculate new pan so the world point stays under the mouse
        const newPanX = mouseX - worldX * newScale;
        const newPanY = mouseY - worldY * newScale;

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
    };

    window.addEventListener("wheel", onWheel as EventListener, { passive: false });
    onCleanup(() => {
        window.removeEventListener("wheel", onWheel as EventListener);
    });

    const borderColor = (selectionType: SelectionType, engineId: string) => {
        if (isSelected(selectionType, engineId)) {
            return "yellow";
        }
        return "transparent";
    };

    return (
        <div
            class={styles.viewport}
            style={{
                left: `${pan().x}px`,
                top: `${pan().y}px`,
                transform: `scale(${scale()})`,
            }}
        >
            {/* Render groups */}
            {getAllGroups().map((group, groupIndex) => (
                <Snappable
                    id={group.id}
                    initial={{ x: 100 + groupIndex * 300, y: 100 }}
                    getScale={scale}
                    isSpaceHeld={props.isSpaceHeld}
                    borderColor={isSelected("group", group.id) ? "#4f8cff" : undefined}
                    onClick={() => selectItem("group", group.id)}
                >
                    <div class={styles.group}>
                        {getMembersOfGroup(group.id).map((engineId) => {
                            const engine = getEngineById(engineId);
                            if (isOscillatorEngine(engine)) {
                                return <WAKOscillator engine={engine} />;
                            } else if (isGainEngine(engine)) {
                                return <WAKGain engine={engine} />;
                            }
                            return null;
                        })}
                    </div>
                </Snappable>
            ))}
            {getUngroupedEngines().map((engine, index) => {
                if (isOscillatorEngine(engine)) {
                    return (
                        <Snappable
                            id={engine.id}
                            initial={{ x: 200 + index * 150, y: 200 }}
                            getScale={scale}
                            isSpaceHeld={props.isSpaceHeld}
                            borderColor={borderColor("engine", engine.id)}
                            onClick={() => selectItem("engine", engine.id)}
                        >
                            <WAKOscillator engine={engine} />
                        </Snappable>
                    );
                } else if (isGainEngine(engine)) {
                    return (
                        <Snappable
                            id={engine.id}
                            initial={{ x: 200 + index * 150, y: 200 }}
                            getScale={scale}
                            isSpaceHeld={props.isSpaceHeld}
                            borderColor={borderColor("engine", engine.id)}
                            onClick={() => selectItem("engine", engine.id)}
                        >
                            <WAKGain engine={engine} />
                        </Snappable>
                    );
                } else {
                    console.warn("Unknown engine type in Viewport:", engine);
                }
                return null;
            })}
        </div>
    );
}
