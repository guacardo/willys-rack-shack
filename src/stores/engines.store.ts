import { createMemo, createSignal } from "solid-js";
import type { IAudioEngine } from "@/audio/engine";
import { getAllGroups } from "./groups.store";

const [engines, setEngines] = createSignal<Map<string, IAudioEngine<any, any>>>(new Map());

export function addEngine(engine: IAudioEngine<any, any>) {
    setEngines((prev) => {
        const next = new Map(prev);
        next.set(engine.id, engine);
        return next;
    });
}

export function removeEngine(id: string) {
    setEngines((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
    });
}

export function getEngineById(id: string): IAudioEngine<any, any> | undefined {
    return engines().get(id);
}

export function getEngineName(id: string): string | undefined {
    const engine = getEngineById(id);
    return engine ? engine.name : undefined;
}

export function getAllEngines(): IAudioEngine<any, any>[] {
    return Array.from(engines().values());
}

export function updateEngine<T extends IAudioEngine<any, any>>(id: string, updates: Partial<T>) {
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
