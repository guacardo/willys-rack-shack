import { createStore } from "solid-js/store";

export type Snappable = {
    id: string;
    x: number;
    y: number;
    radius: number;
    onSnap: () => void;
};

type SnappablesState = {
    snappables: Snappable[];
    selectedSnappableId: string | null;
};

const [state, setState] = createStore<SnappablesState>({
    snappables: [],
    selectedSnappableId: null,
});

export function registerSnappable(snappable: Snappable) {
    setState("snappables", (snappables) => [...snappables, snappable]);
}

export function unregisterSnappable(id: string) {
    setState("snappables", (snappables) => snappables.filter((t) => t.id !== id));
    if (state.selectedSnappableId === id) {
        setState("selectedSnappableId", null);
    }
}

export function updatePosition(id: string, x: number, y: number) {
    setState("snappables", (targets) => targets.map((t) => (t.id === id ? { ...t, x, y } : t)));
    console.log(state.snappables);
}

export function selectSnappable(id: string) {
    setState("selectedSnappableId", id);
}

export function clearSelectedSnappable() {
    setState("selectedSnappableId", null);
}

export { state as snappablesState };
