import "./theme.scss";
import { Viewport } from "./views/viewport/viewport";
import { createSignal, createEffect } from "solid-js";
import { StatusBar } from "./views/status-bar/status-bar";
import { ContextBar } from "./views/context-bar/context-bar";
import { EngineDetails } from "./views/engine-details/engine-details";
import { EngineGroups } from "./views/engine-groups/engine-groups";
import { Connections } from "./views/connections/connections";

function App() {
    const [theme, setTheme] = createSignal<"light" | "dark" | "neon-green" | "synthwave">("dark");

    // Apply theme when it changes
    createEffect(() => {
        document.body.setAttribute("data-theme", theme());
    });

    return (
        <>
            <StatusBar theme={theme()} setTheme={setTheme} />
            <ContextBar visible={true}>
                <EngineGroups expanded={true} />
                <EngineDetails />
                <Connections expanded={true} />
            </ContextBar>
            <Viewport />
        </>
    );
}

export default App;
