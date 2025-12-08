import { createSignal, onCleanup } from "solid-js";
import { WAKOscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { WAKGain } from "@/components/wak/gain/WAK.Gain";
import { Snappable } from "@/components/ui/snappable/snappable";
import { getUngroupedEngines } from "@/stores/engines.store";
import { isGainEngine } from "@/audio/gain.engine";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { selectItem, isSelected } from "@/stores/selection.store";
import { getAllGroups } from "@/stores/groups.store";

import styles from "./viewport.module.scss";
import { ViewportEngineModule } from "./engine-module/engine-module";

export interface ViewportProps {
    getScale?: () => number;
    isSpaceHeld?: boolean;
    initialPan?: { x: number; y: number };
}

export function Viewport() {
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);
    const [isGrabbing, setIsGrabbing] = createSignal(false);
    const [pan, setPan] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });
    const [scale, setScale] = createSignal<number>(1);

    // Listen for spacebar keydown/keyup globally
    const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space") setIsSpaceHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") setIsSpaceHeld(false);
    };

    // Pan
    const onViewportMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return;
        if (!isSpaceHeld()) return;

        setIsGrabbing(true);
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
                setIsGrabbing(false);
            },
            { once: true }
        );
    };

    // Zoom
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

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onViewportMouseDown);
    window.addEventListener("wheel", onWheel, { passive: false });

    onCleanup(() => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("mousedown", onViewportMouseDown);
        window.removeEventListener("wheel", onWheel);
    });

    return (
        <div class={styles["viewport-container"]}>
            <div
                class={`${styles.viewport} ${isSpaceHeld() ? (isGrabbing() ? styles.grabbing : styles.grab) : ""}`}
                style={{
                    left: `${pan().x}px`,
                    top: `${pan().y}px`,
                    transform: `scale(${scale()})`,
                }}
            >
                {/* GROUPED ENGINES */}
                {getAllGroups().map((group) => (
                    <ViewportEngineModule id={group.id} viewport={{ getScale: scale, isSpaceHeld: isSpaceHeld() }} />
                ))}
                {/* UNGROUPED ENGINES */}
                {getUngroupedEngines().map((engine) => {
                    return (
                        <Snappable
                            id={engine.id}
                            initial={{
                                x: (window.innerWidth / 2 - pan().x) / scale() - 200,
                                y: (window.innerHeight / 2 - pan().y) / scale() - 200,
                            }}
                            getScale={scale}
                            isSpaceHeld={isSpaceHeld()}
                            borderColor={isSelected("engine", engine.id) ? "#4f8cff" : undefined}
                            onClick={() => selectItem("engine", engine.id)}
                        >
                            {isOscillatorEngine(engine) ? (
                                <WAKOscillator id={engine.id} />
                            ) : isGainEngine(engine) ? (
                                <WAKGain id={engine.id} />
                            ) : (
                                (() => {
                                    console.warn("Unknown engine type in Viewport:", engine);
                                    return null;
                                })()
                            )}
                        </Snappable>
                    );
                })}
            </div>
        </div>
    );
}
