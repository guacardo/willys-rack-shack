import "./theme.scss";
import styles from "./app.module.scss";
import { Viewport } from "./views/viewport";
import { createSignal } from "solid-js";

function App() {
    document.body.setAttribute("data-theme", "neon-green");

    // Signals for spacebar and mouse movement (panning)
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);
    const [isGrabbing, setIsGrabbing] = createSignal(false);

    return (
        <>
            <div class={`${styles.app} ${isSpaceHeld() ? (isGrabbing() ? styles.grabbing : styles.grab) : ""}`}>
                <Viewport setIsSpaceHeld={setIsSpaceHeld} isSpaceHeld={isSpaceHeld()} setIsGrabbing={setIsGrabbing} />
            </div>
        </>
    );
}

export default App;
