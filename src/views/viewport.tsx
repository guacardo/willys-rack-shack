import { createSignal, onCleanup } from "solid-js";
import { Draggable } from "../components/ui/draggable/draggable";
import { Oscillator } from "@/components/wak/oscillator/WAK.Oscillator";
import { Gain } from "@/components/wak/gain/WAK.Gain";

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

    return (
        <div
            style={{
                position: "absolute",
                left: `${pan().x}px`,
                top: `${pan().y}px`,
                width: "100vw",
                height: "100vh",
                overflow: "visible",
                "z-index": 100,
                transform: `scale(${scale()})`,
                "transform-origin": "0 0",
            }}
        >
            <Draggable initial={{ x: 50, y: 50 }} getScale={scale} isSpaceHeld={props.isSpaceHeld}>
                <Oscillator />
            </Draggable>
            <Draggable initial={{ x: 200, y: 120 }} getScale={scale} isSpaceHeld={props.isSpaceHeld}>
                <Oscillator />
            </Draggable>
            <Draggable initial={{ x: 350, y: 200 }} getScale={scale} isSpaceHeld={props.isSpaceHeld}>
                <Gain />
            </Draggable>
        </div>
    );
}
