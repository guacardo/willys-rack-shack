import { createSignal } from "solid-js";
import type { IAudioEngine } from "@/audio/engine";

const [engines, setEngines] = createSignal<IAudioEngine[]>([]);

export function addEngine(engine: IAudioEngine) {
    setEngines([...engines(), engine]);
}

export function removeEngine(engine: IAudioEngine) {
    setEngines(engines().filter((e) => e !== engine));
}

export { engines, setEngines };
