import "./theme.scss";
import styles from "./app.module.scss";
import { Viewport } from "./views/viewport";
import { createSignal } from "solid-js";
import { WebAudioProvider } from "./contexts/web-audio-context";
import { TopStatus } from "./views/top-status/top-status";

function App() {
    document.body.setAttribute("data-theme", "neon-green");

    // Signals for spacebar and mouse movement (panning)
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);
    const [isGrabbing, setIsGrabbing] = createSignal(false);

    return (
        <WebAudioProvider>
            <div class={`${styles.app} ${isSpaceHeld() ? (isGrabbing() ? styles.grabbing : styles.grab) : ""}`}>
                <TopStatus />
                <Viewport setIsSpaceHeld={setIsSpaceHeld} isSpaceHeld={isSpaceHeld()} setIsGrabbing={setIsGrabbing} />
            </div>
        </WebAudioProvider>
    );
}

export default App;
