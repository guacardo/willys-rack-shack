import "./theme.scss";
import { Viewport } from "./views/viewport/viewport";
import { createSignal, createEffect } from "solid-js";
import { WebAudioProvider } from "./contexts/web-audio-context";
import { StatusBar } from "./views/status-bar/status-bar";
import { ContextBar } from "./views/context-bar/context-bar";
import { EngineDetails } from "./views/engine-details/engine-details";
import { EngineGroups } from "./views/engine-groups/engine-groups";

function App() {
    const [theme, setTheme] = createSignal<"light" | "dark" | "neon-green">("neon-green");

    // Apply theme when it changes
    createEffect(() => {
        document.body.setAttribute("data-theme", theme());
    });

    return (
        <WebAudioProvider>
            <StatusBar theme={theme()} setTheme={setTheme} />
            <ContextBar visible={true}>
                <EngineGroups expanded={true} />
                <EngineDetails />
            </ContextBar>
            <Viewport />
        </WebAudioProvider>
    );
}

export default App;
