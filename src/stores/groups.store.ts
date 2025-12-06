import { createStore } from "solid-js/store";
import { addEngine } from "./engines.store";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";

// group.store.ts
export type Group = {
    id: string;
    name: string;
    members: string[]; // item IDs
};

const [groups, setGroups] = createStore<Group[]>([]);

export function createGroup(name: string, members: string[] = []) {
    const id = crypto.randomUUID();
    setGroups([...groups, { id, name, members }]);
    return id;
}

export function createGroupFromTemplate(template: "empty" | "single-osc" | "poly-voice" | "lfo'mod", audioCtx: AudioContext): string {
    const id = crypto.randomUUID();

    switch (template) {
        case "empty":
            const gain = new GainEngine(audioCtx);
            addEngine(gain);
            createGroup("Empty Group", [gain.id]);
            break;
        case "single-osc":
            const osc = new OscillatorEngine(audioCtx);
            const outGain = new GainEngine(audioCtx);
            addEngine(osc);
            addEngine(outGain);
            createGroup("Single Osc", [osc.id, outGain.id]);
            // syncGroupConnections(groupId); // Auto-connect
            break;
    }

    return id;
}

export function addMember(groupId: string, memberId: string) {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, members: g.members.includes(memberId) ? g.members : [...g.members, memberId] } : g)));
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

export function getMembersOfGroup(groupId: string): string[] {
    const group = groups.find((g) => g.id === groupId);
    return group ? group.members : [];
}

export function setGroupName(groupId: string, name: string) {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, name } : g)));
}

export { groups, setGroups };
