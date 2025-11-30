import { createSignal } from "solid-js";
import type { IAudioEngine } from "@/audio/engine";

const [engines, setEngines] = createSignal<Map<string, IAudioEngine>>(new Map());

export function addEngine(engine: IAudioEngine) {
    setEngines((prev) => {
        const next = new Map(prev);
        next.set(engine.id, engine);
        return next;
    });
}

export function removeEngine(engine: IAudioEngine) {
    setEngines((prev) => {
        const next = new Map(prev);
        next.delete(engine.id);
        return next;
    });
}

export function getEngineById(id: string): IAudioEngine | undefined {
    return engines().get(id);
}

export function getAllEngines(): IAudioEngine[] {
    return Array.from(engines().values());
}

export function updateEngine(id: string, updater: (engine: IAudioEngine) => IAudioEngine) {
    setEngines((prev) => {
        const next = new Map(prev);
        const current = next.get(id);
        if (current) {
            next.set(id, updater(current));
        }
        return next;
    });
}

export { engines, setEngines };
