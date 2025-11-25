import { createSignal, onCleanup } from "solid-js";

interface ViewportProps {
    setIsSpaceHeld: (held: boolean) => void;
    isSpaceHeld: boolean;
}

export function Viewport(props: ViewportProps) {
    const [pan, setPan] = createSignal<{ x: number; y: number }>({ x: 0, y: 0 });
    const [scale, setScale] = createSignal<number>(1);
    const [elemPos1, setElemPos1] = createSignal<{ x: number; y: number }>({ x: 50, y: 50 });
    const [elemPos2, setElemPos2] = createSignal<{ x: number; y: number }>({ x: 200, y: 120 });

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
        window.addEventListener("mouseup", () => window.removeEventListener("mousemove", onMouseMove), { once: true });
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

    // Drag logic for element 1
    const onElem1MouseDown = (e: MouseEvent) => {
        if (props.isSpaceHeld) return; // Prevent element drag if space is held (panning mode)
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const origPos = elemPos1();

        const factor = 1 / scale();
        const onMouseMove = (moveEvent: MouseEvent) => {
            setElemPos1({
                x: origPos.x + (moveEvent.clientX - startX) * factor,
                y: origPos.y + (moveEvent.clientY - startY) * factor,
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", () => window.removeEventListener("mousemove", onMouseMove), { once: true });
    };

    // Drag logic for element 2
    const onElem2MouseDown = (e: MouseEvent) => {
        if (props.isSpaceHeld) return; // Prevent element drag if space is held (panning mode)
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const origPos = elemPos2();

        const factor = 1 / scale();
        const onMouseMove = (moveEvent: MouseEvent) => {
            setElemPos2({
                x: origPos.x + (moveEvent.clientX - startX) * factor,
                y: origPos.y + (moveEvent.clientY - startY) * factor,
            });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", () => window.removeEventListener("mousemove", onMouseMove), { once: true });
    };

    return (
        <div
            style={{
                position: "absolute",
                left: `${pan().x}px`,
                top: `${pan().y}px`,
                width: "100vw",
                height: "100vh",
                background: "transparent",
                overflow: "visible",
                "z-index": 100,
                transform: `scale(${scale()})`,
                "transform-origin": "0 0",
            }}
        >
            {/* Element 1 */}
            <div
                style={{
                    position: "absolute",
                    left: `${elemPos1().x}px`,
                    top: `${elemPos1().y}px`,
                    width: "80px",
                    height: "80px",
                    background: "lime",
                    cursor: "grab",
                }}
                onMouseDown={onElem1MouseDown}
            >
                Drag me 1!
            </div>
            {/* Element 2 */}
            <div
                style={{
                    position: "absolute",
                    left: `${elemPos2().x}px`,
                    top: `${elemPos2().y}px`,
                    width: "80px",
                    height: "80px",
                    background: "deepskyblue",
                    cursor: "grab",
                }}
                onMouseDown={onElem2MouseDown}
            >
                Drag me 2!
            </div>
        </div>
    );
}
