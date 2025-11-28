import "./theme.scss";
import styles from "./app.module.scss";
import { Viewport } from "./views/viewport";
import { createSignal, createEffect } from "solid-js";
import { WebAudioProvider } from "./contexts/web-audio-context";
import { StatusBar } from "./views/status-bar/status-bar";
import { ModuleGroups } from "./views/module-groups/module-groups";
import { ContextBar } from "./views/context-bar/context-bar";
import { ModuleDetails } from "./views/module-details/module-details";
import type { IAudioEngine } from "./audio/engine";

function App() {
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);
    const [isGrabbing, setIsGrabbing] = createSignal(false);
    const [theme, setTheme] = createSignal<"light" | "dark" | "neon-green">("neon-green");
    const [currentModule, setCurrentModule] = createSignal<IAudioEngine | null>(null);

    // Apply theme when it changes
    createEffect(() => {
        document.body.setAttribute("data-theme", theme());
    });

    return (
        <WebAudioProvider>
            <StatusBar theme={theme()} setTheme={setTheme} />
            <ContextBar visible={true}>
                <ModuleGroups expanded={true} currentModule={currentModule()} setCurrentModule={setCurrentModule} />
                <ModuleDetails module={currentModule()} />
            </ContextBar>

            <div class={`${styles.app} ${isSpaceHeld() ? (isGrabbing() ? styles.grabbing : styles.grab) : ""}`}>
                <Viewport setIsSpaceHeld={setIsSpaceHeld} isSpaceHeld={isSpaceHeld()} setIsGrabbing={setIsGrabbing} />
            </div>
        </WebAudioProvider>
    );
}

export default App;
