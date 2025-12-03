import { createMemo, createSignal } from "solid-js";
import type { IAudioEngine } from "@/audio/engine";
import { getAllGroups } from "./groups.store";

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

export function updateEngine<T extends IAudioEngine>(id: string, updates: Partial<T>) {
    setEngines((prev) => {
        const next = new Map(prev);
        const current = next.get(id);
        if (current) {
            Object.assign(current, updates);
            next.set(id, current);
        }
        return next;
    });
}

export const getUngroupedEngines = createMemo(() => {
    const groupedIds = new Set(getAllGroups().flatMap((group) => group.members));
    return getAllEngines().filter((engine) => !groupedIds.has(engine.id));
});

export { engines, setEngines };
