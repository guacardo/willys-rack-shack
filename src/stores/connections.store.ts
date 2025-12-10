import type { OscillatorPorts } from "@/audio/oscillator.engine";
import type { GainPorts } from "@/audio/gain.engine";
import type { EngineTypeKey } from "@/audio/engine";
import { createSignal } from "solid-js";
import { getEngineById } from "./engines.store";
import type { IAudioEngine } from "@/audio/engine";
import { getMembersOfGroup } from "./groups.store";
import { getAudioContext } from "./web-audio-context.store";

type EnginePortMap = {
    oscillator: keyof OscillatorPorts;
    gain: keyof GainPorts;
};

type Terminal = {
    id: string;
    type: EngineTypeKey | "destination";
    port: EnginePortMap[EngineTypeKey];
};

type TerminalKey = string;

export type Connection = {
    from: Terminal;
    to: Terminal;
};

export function terminalToKey(terminal: Terminal): TerminalKey {
    return `${terminal.id}|${terminal.type}|${terminal.port}` as TerminalKey;
}

export function keyToTerminal(key: string): Terminal {
    const [id, type, port] = key.split("|");
    return { id, type: type as EngineTypeKey | "destination", port: port as EnginePortMap[EngineTypeKey] };
}

const [connectionsMap, setConnectionsMap] = createSignal<Map<TerminalKey, Set<TerminalKey>>>(new Map());

// Add a connection (bi-directional)
export function addConnection(connection: Connection) {
    setConnectionsMap((prev) => {
        const map = new Map(prev);
        const fromKey = terminalToKey(connection.from);
        const toKey = terminalToKey(connection.to);
        // Add to 'from'
        if (!map.has(fromKey)) map.set(fromKey, new Set());
        map.get(fromKey)!.add(toKey);
        // Add to 'to' (bi-directional)
        if (!map.has(toKey)) map.set(toKey, new Set());
        map.get(toKey)!.add(fromKey);
        return map;
    });

    console.log(connectionsMap());
}

// Remove a connection (bi-directional)
export function removeConnection(connection: Connection) {
    setConnectionsMap((prev) => {
        const map = new Map(prev);
        const fromKey = terminalToKey(connection.from);
        const toKey = terminalToKey(connection.to);
        // Remove from 'from'
        if (map.has(fromKey)) {
            map.get(fromKey)!.delete(toKey);
            if (map.get(fromKey)!.size === 0) map.delete(fromKey);
        }
        // Remove from 'to'
        if (map.has(toKey)) {
            map.get(toKey)!.delete(fromKey);
            if (map.get(toKey)!.size === 0) map.delete(toKey);
        }
        return map;
    });
}

// Get all connections as an array of Connection objects
export function getConnections(): Connection[] {
    const arr: Connection[] = [];
    const map = connectionsMap();
    for (const [fromKey, toSet] of map.entries()) {
        for (const toKey of toSet) {
            // Only push one direction to avoid duplicates
            if (fromKey < toKey) {
                arr.push({ from: keyToTerminal(fromKey), to: keyToTerminal(toKey) });
            }
        }
    }
    return arr;
}

// Remove all connections
export function clearConnections() {
    setConnectionsMap(new Map());
}

// Check if a terminal is connected to any other
export function isPortConnected(terminal: Terminal): boolean {
    const key = terminalToKey(terminal);
    const map = connectionsMap();
    return map.has(key) && map.get(key)!.size > 0;
}

export function syncGroupConnections(groupId: string) {
    const audioCtx = getAudioContext();
    const memberIds = getMembersOfGroup(groupId);
    // Only keep defined engines and type them as IAudioEngine<any, any>
    const engines = memberIds.map((id) => getEngineById(id)).filter((e): e is IAudioEngine<any, any> => e !== undefined);

    // Find sources (oscillators) and gains, with correct type guards
    const sources = engines.filter((e): e is IAudioEngine<any, any> & { engineType: "oscillator" } => e.engineType === "oscillator");
    const gains = engines.filter((e): e is IAudioEngine<any, any> & { engineType: "gain" } => e.engineType === "gain");

    // Only auto-connect if this is a "source group" (has both sources and gains)
    if (sources.length > 0 && gains.length > 0) {
        const outputGain = gains[0]; // First gain is the output gain

        // Get all current connections as an array
        const allConnections = getConnections();

        // Connect all sources to the output gain
        sources.forEach((source) => {
            const connection: Connection = {
                from: { id: source.id, type: "oscillator", port: "output" },
                to: { id: outputGain.id, type: "gain", port: "input" },
            };

            // Check if connection already exists
            const exists = allConnections.some(
                (c) =>
                    c.from.id === connection.from.id && c.from.port === connection.from.port && c.to.id === connection.to.id && c.to.port === connection.to.port
            );

            if (!exists) {
                source.connect(outputGain.ports.input as AudioNode);
                addConnection(connection);
            }
        });

        // Connect output gain to audio destination
        const destConnection: Connection = {
            from: { id: outputGain.id, type: "gain", port: "output" },
            to: { id: "destination", type: "destination", port: "input" }, // Special ID for destination
        };

        const destExists = allConnections.some(
            (c) => c.from.id === destConnection.from.id && c.from.port === destConnection.from.port && c.to.id === destConnection.to.id
        );

        if (!destExists) {
            addConnection(destConnection);
            outputGain.connect(audioCtx.destination);
        }
    }
}

export { connectionsMap };
