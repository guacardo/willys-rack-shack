import "./theme.scss";
import styles from "./app.module.scss";
import { Viewport } from "./views/viewport/viewport";
import { createSignal, createEffect } from "solid-js";
import { WebAudioProvider } from "./contexts/web-audio-context";
import { StatusBar } from "./views/status-bar/status-bar";
import { ContextBar } from "./views/context-bar/context-bar";
import { EngineDetails } from "./views/engine-details/engine-details";
import { EngineGroups } from "./views/engine-groups/engine-groups";

function App() {
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);
    const [isGrabbing, setIsGrabbing] = createSignal(false);
    const [theme, setTheme] = createSignal<"light" | "dark" | "neon-green">("neon-green");
    const [currentEngineId, setCurrentEngineId] = createSignal<string | null>(null);

    // Apply theme when it changes
    createEffect(() => {
        document.body.setAttribute("data-theme", theme());
    });

    return (
        <WebAudioProvider>
            <StatusBar theme={theme()} setTheme={setTheme} />
            <ContextBar visible={true}>
                <EngineGroups expanded={true} currentEngineId={currentEngineId()} setCurrentEngine={setCurrentEngineId} />
                <EngineDetails id={currentEngineId()} />
            </ContextBar>

            <div class={`${styles.app} ${isSpaceHeld() ? (isGrabbing() ? styles.grabbing : styles.grab) : ""}`}>
                <Viewport
                    setIsSpaceHeld={setIsSpaceHeld}
                    isSpaceHeld={isSpaceHeld()}
                    setIsGrabbing={setIsGrabbing}
                    currentEngineId={currentEngineId()}
                    setCurrentEngine={setCurrentEngineId}
                />
            </div>
        </WebAudioProvider>
    );
}

export default App;
