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
    console.log("Getting engine by ID:", id);
    return engines().get(id);
}

export function getAllEngines(): IAudioEngine[] {
    return Array.from(engines().values());
}

export function updateEngine(id: string, updates: Partial<IAudioEngine>) {
    setEngines((prev) => {
        const next = new Map(prev);
        const current = next.get(id);
        if (current) {
            const updated = current.update(updates);
            next.set(id, updated);
        }
        return next;
    });
}

export { engines, setEngines };
