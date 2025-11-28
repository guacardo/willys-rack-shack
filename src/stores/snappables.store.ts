import type { IAudioEngine } from "@/audio/engine";
import { createStore } from "solid-js/store";

export type SnapTarget = {
    id: string;
    x: number;
    y: number;
    radius: number;
    engine: IAudioEngine;
    onSnap: () => void;
};

const [snapTargets, setSnapTargets] = createStore<SnapTarget[]>([]);

export function registerSnapTarget(target: Omit<SnapTarget, "id">): string {
    const id = crypto.randomUUID();
    setSnapTargets([...snapTargets, { ...target, id }]);
    return id;
}

export function unregisterSnapTarget(id: string) {
    setSnapTargets(snapTargets.filter((t) => t.id !== id));
}

export { snapTargets };
