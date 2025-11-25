import "./theme.scss";
import styles from "./app.module.scss";
import { Viewport } from "./views/viewport";
import { createSignal } from "solid-js";

function App() {
    document.body.setAttribute("data-theme", "neon-green");

    // Move isSpaceHeld signal up to App and pass as prop
    const [isSpaceHeld, setIsSpaceHeld] = createSignal(false);

    return (
        <>
            <div class={`${styles.app} ${isSpaceHeld() ? styles.grabbing : ""}`}>
                <Viewport setIsSpaceHeld={setIsSpaceHeld} isSpaceHeld={isSpaceHeld()} />
            </div>
        </>
    );
}

export default App;
