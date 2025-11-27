import "./theme.scss";
import styles from "./app.module.scss";
import { Viewport } from "./views/viewport";
import { createSignal, createEffect } from "solid-js";
import { WebAudioProvider } from "./contexts/web-audio-context";
import { TopStatus } from "./views/top-status/top-status";

function App() {
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);
    const [isGrabbing, setIsGrabbing] = createSignal(false);
    const [theme, setTheme] = createSignal<"light" | "dark" | "neon-green">("neon-green");

    // Apply theme when it changes
    createEffect(() => {
        document.body.setAttribute("data-theme", theme());
    });

    return (
        <WebAudioProvider>
            <div class={`${styles.app} ${isSpaceHeld() ? (isGrabbing() ? styles.grabbing : styles.grab) : ""}`}>
                <TopStatus theme={theme()} setTheme={setTheme} />
                <Viewport setIsSpaceHeld={setIsSpaceHeld} isSpaceHeld={isSpaceHeld()} setIsGrabbing={setIsGrabbing} />
            </div>
        </WebAudioProvider>
    );
}

export default App;
