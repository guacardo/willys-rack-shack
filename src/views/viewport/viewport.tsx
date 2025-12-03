import { createSignal, onCleanup } from "solid-js";
import { WAKOscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { WAKGain } from "@/components/wak/gain/WAK.Gain";
import { Snappable } from "@/components/ui/snappable/snappable";
import { getEngineById, getUngroupedEngines } from "@/stores/engines.store";
import { isGainEngine } from "@/audio/gain.engine";
import { isOscillatorEngine } from "@/audio/oscillator.engine";
import { selectItem, isSelected } from "@/stores/selection.store";
import { getAllGroups, getMembersOfGroup } from "@/stores/groups.store";

import styles from "./viewport.module.scss";
import { WUTText } from "@/components/wut/text/WUT.Text";

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
                {getAllGroups().map((group, groupIndex) => (
                    <Snappable
                        id={group.id}
                        initial={{ x: 100 + groupIndex * 300, y: 100 }}
                        getScale={scale}
                        isSpaceHeld={isSpaceHeld()}
                        borderColor={isSelected("group", group.id) ? "#4f8cff" : undefined}
                        onClick={() => selectItem("group", group.id)}
                    >
                        <div class={styles.group}>
                            <WUTText variant="header">{group.name}</WUTText>
                            {getMembersOfGroup(group.id).map((engineId) => {
                                const engine = getEngineById(engineId);
                                if (isOscillatorEngine(engine)) {
                                    return <WAKOscillator id={engine.id} />;
                                } else if (isGainEngine(engine)) {
                                    return <WAKGain id={engine.id} />;
                                }
                                return null;
                            })}
                        </div>
                    </Snappable>
                ))}
                {/* UNGROUPED ENGINES */}
                {getUngroupedEngines().map((engine) => {
                    if (isOscillatorEngine(engine)) {
                        return (
                            <Snappable
                                id={engine.id}
                                initial={{ x: 100, y: 100 }}
                                getScale={scale}
                                isSpaceHeld={isSpaceHeld()}
                                borderColor={isSelected("engine", engine.id) ? "#4f8cff" : undefined}
                                onClick={() => selectItem("engine", engine.id)}
                            >
                                <WAKOscillator id={engine.id} />
                            </Snappable>
                        );
                    } else if (isGainEngine(engine)) {
                        return (
                            <Snappable
                                id={engine.id}
                                initial={{ x: 100, y: 100 }}
                                getScale={scale}
                                isSpaceHeld={isSpaceHeld()}
                                borderColor={isSelected("engine", engine.id) ? "#4f8cff" : undefined}
                                onClick={() => selectItem("engine", engine.id)}
                            >
                                <WAKGain id={engine.id} />
                            </Snappable>
                        );
                    } else {
                        console.warn("Unknown engine type in Viewport:", engine);
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
