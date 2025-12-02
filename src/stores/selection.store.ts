import { createSignal } from "solid-js";

export type SelectionType = "group" | "engine";
export type Selection = {
    type: SelectionType;
    id: string;
};

const [selection, setSelection] = createSignal<Selection | null>(null);

export function selectItem(type: SelectionType, id: string) {
    setSelection({ type, id });
}

export function clearSelection() {
    setSelection(null);
}

export function isSelected(type: SelectionType, id: string): boolean {
    const sel = selection();
    return sel?.type === type && sel.id === id;
}

export { selection };
