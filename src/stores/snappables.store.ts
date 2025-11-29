import { createStore } from "solid-js/store";

export type Snappable = {
    id: string;
    x: number;
    y: number;
    radius: number;
    onSnap: () => void;
};

const [snappables, setSnappables] = createStore<Snappable[]>([]);

export function registerSnappable(snappable: Snappable) {
    setSnappables([...snappables, snappable]);
}

export function unregisterSnappable(id: string) {
    setSnappables(snappables.filter((t) => t.id !== id));
}
export function updatePosition(id: string, x: number, y: number) {
    setSnappables((targets) => targets.map((t) => (t.id === id ? { ...t, x, y } : t)));
    console.log(snappables);
}

export { snappables };
