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

export function createGroupFromTemplate(template: GroupTemplate, audioCtx: AudioContext): string {
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
        case "poly-voice":
            const osc1 = new OscillatorEngine(audioCtx);
            const osc2 = new OscillatorEngine(audioCtx);
            const osc3 = new OscillatorEngine(audioCtx);
            const gain1 = new GainEngine(audioCtx);
            osc1.setAudioParams({ frequency: 150 });
            osc2.setAudioParams({ frequency: 200 });
            osc3.setAudioParams({ frequency: 300 });
            addEngine(osc1);
            addEngine(osc2);
            addEngine(osc3);
            addEngine(gain1);
            id = createGroup("Poly Voice", [osc1.id, osc2.id, osc3.id, gain1.id]);
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
