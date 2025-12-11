import { createStore } from "solid-js/store";
import { addEngine } from "./engines.store";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { syncGroupConnections } from "./connections.store";

// group.store.ts
export type Group = {
    id: string;
    name: string;
    members: string[]; // item IDs
};

export type GroupTemplate = "empty" | "single-osc" | "poly-voice" | "lfo-mod";
export const groupTemplateOptions: Record<GroupTemplate, string> = {
    empty: "Empty Group",
    "single-osc": "Single Oscillator",
    "poly-voice": "Polyphonic Voice",
    "lfo-mod": "LFO Modulation",
};

const [groups, setGroups] = createStore<Group[]>([]);

export function createGroup(name: string, members: string[] = []) {
    const id = crypto.randomUUID();
    setGroups([...groups, { id, name, members }]);
    return id;
}

export function createGroupFromTemplate(template: "empty" | "single-osc" | "poly-voice" | "lfo-mod", audioCtx: AudioContext): string {
    let id = "";
    switch (template) {
        case "empty":
            const gain = new GainEngine(audioCtx);
            addEngine(gain);
            id = createGroup("Empty Group", [gain.id]);
            break;
        case "single-osc":
            const osc = new OscillatorEngine(audioCtx);
            const outGain = new GainEngine(audioCtx);
            addEngine(osc);
            addEngine(outGain);
            id = createGroup("Single Osc", [osc.id, outGain.id]);
            break;
    }

    syncGroupConnections(id);

    return id;
}

export function addMember(groupId: string, memberId: string) {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, members: g.members.includes(memberId) ? g.members : [...g.members, memberId] } : g)));
    // TODO: careful with this. should probably move this to a controller, not here.
    syncGroupConnections(groupId);
}

export function removeMember(groupId: string, memberId: string) {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, members: g.members.filter((id) => id !== memberId) } : g)));
}

export function deleteGroup(groupId: string) {
    setGroups(groups.filter((g) => g.id !== groupId));
}

export function getAllGroups(): Group[] {
    return groups;
}

export function getGroup(id: string): Group | undefined {
    return groups.find((g) => g.id === id);
}

export function getMembersOfGroup(groupId: string): string[] {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.members : [];
}

export function setGroupName(groupId: string, name: string) {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, name } : g)));
}

export { groups, setGroups };
