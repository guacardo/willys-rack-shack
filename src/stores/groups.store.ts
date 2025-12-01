import { createStore } from "solid-js/store";

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

export { groups, setGroups };
