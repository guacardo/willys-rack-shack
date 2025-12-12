import type { OscillatorPorts } from "@/audio/oscillator.engine";
import type { GainPorts } from "@/audio/gain.engine";
import type { LFOPorts } from "@/audio/lfo.engine";
import type { EngineTypeKey } from "@/audio/engine";
import { createSignal } from "solid-js";

export type ConnectionStatus = "on" | "off" | "who-knows" | "error";

type EnginePortMap = {
    oscillator: keyof OscillatorPorts;
    gain: keyof GainPorts;
    lfo: keyof LFOPorts;
};

export type Terminal = {
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
}

export function removeConnection(connection: Connection) {
    // ONLY handle state updates - no Web Audio stuff
    setConnectionsMap((prev) => {
        const map = new Map(prev);
        const fromKey = terminalToKey(connection.from);
        const toKey = terminalToKey(connection.to);

        if (map.has(fromKey)) {
            map.get(fromKey)!.delete(toKey);
            if (map.get(fromKey)!.size === 0) map.delete(fromKey);
        }

        if (map.has(toKey)) {
            map.get(toKey)!.delete(fromKey);
            if (map.get(toKey)!.size === 0) map.delete(toKey);
        }

        return map;
    });
}

// Remove all connections for a given engine ID
export function removeAllConnectionsForEngine(engineId: string) {
    const allConnections = getConnections();
    allConnections.forEach((conn) => {
        if (conn.from.id === engineId || conn.to.id === engineId) {
            removeConnection(conn);
        }
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
export function getPortStatus(terminal: Terminal): ConnectionStatus {
    const key = terminalToKey(terminal);
    const map = connectionsMap();

    return map.has(key) && map.get(key)!.size > 0 ? "on" : "off";
}

export { connectionsMap };
