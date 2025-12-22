import { createStore } from "solid-js/store";
import { GainEngine } from "@/audio/gain.engine";
import { OscillatorEngine } from "@/audio/oscillator.engine";
import { audioConnectionService } from "@/services/audio-connection.service";
import { LFOEngine } from "@/audio/lfo.engine";
import type { KeyboardController } from "@/services/keyboard-control.service";

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
            id = createGroup("Empty Group", [new GainEngine(audioCtx).id]);
            break;
        case "single-osc":
            const osc = new OscillatorEngine(audioCtx);
            const modulator = new LFOEngine(audioCtx);
            const outGain = new GainEngine(audioCtx);

            audioConnectionService.connect(modulator.terminal("output"), osc.terminal("frequency"));
            audioConnectionService.connect(osc.terminal("output"), outGain.terminal("input"));
            audioConnectionService.connect(outGain.terminal("output"), { id: "destination", type: "destination", port: "input" });

            id = createGroup("Single Osc", [osc.id, modulator.id, outGain.id]);
            break;
        case "poly-voice":
            const osc1 = new OscillatorEngine(audioCtx);
            const osc2 = new OscillatorEngine(audioCtx);
            const osc3 = new OscillatorEngine(audioCtx);
            const modulator1 = new LFOEngine(audioCtx);
            const outGain1 = new GainEngine(audioCtx);
            osc1.setAudioParams({ frequency: 150 });
            osc2.setAudioParams({ frequency: 200 });
            osc3.setAudioParams({ frequency: 300 });

            audioConnectionService.connect(modulator1.terminal("output"), osc1.terminal("frequency"));
            audioConnectionService.connect(modulator1.terminal("output"), osc2.terminal("frequency"));
            audioConnectionService.connect(modulator1.terminal("output"), osc3.terminal("frequency"));
            audioConnectionService.connect(osc1.terminal("output"), outGain1.terminal("input"));
            audioConnectionService.connect(osc2.terminal("output"), outGain1.terminal("input"));
            audioConnectionService.connect(osc3.terminal("output"), outGain1.terminal("input"));
            audioConnectionService.connect(outGain1.terminal("output"), { id: "destination", type: "destination", port: "input" });

            id = createGroup("Poly Voice", [osc1.id, osc2.id, osc3.id, modulator1.id, outGain1.id]);
            break;
        case "lfo-mod":
            const lfo = new LFOEngine(audioCtx);
            const modulatedOsc = new OscillatorEngine(audioCtx);
            const gain = new GainEngine(audioCtx);
            lfo.setAudioParams({ frequency: 5 });
            // audioConnectionService.connect(lfo.id, modulatedOsc.id);
            // lfoGain.setAudioParams({ gain: 100 });
            id = createGroup("LFO Mod", [lfo.id, modulatedOsc.id, gain.id]);
            break;
    }

    // Use the service to handle all connections
    // audioConnectionService.syncGroupConnections(id);

    return id;
}

const keyboardControllers = new Map<string, KeyboardController>();
export function registerKeyboardController(groupId: string, controller: KeyboardController) {
    keyboardControllers.set(groupId, controller);
}

export function addMember(groupId: string, memberId: string) {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, members: g.members.includes(memberId) ? g.members : [...g.members, memberId] } : g)));

    // Notify keyboard controller if exists
    const controller = keyboardControllers.get(groupId);
    if (controller) {
        controller.scan(); // Re-scan to pick up new member
    }

    // Use the service to sync connections
    audioConnectionService.syncGroupConnections(groupId);
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
