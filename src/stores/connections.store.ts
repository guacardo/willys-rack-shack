import type { OscillatorPorts } from "@/audio/oscillator.engine";
import type { GainPorts } from "@/audio/gain.engine";
import type { EngineType } from "@/audio/engine";
import { createSignal } from "solid-js";

type EnginePortMap = {
    oscillator: OscillatorPorts;
    gain: GainPorts;
};

type Terminal = {
    id: string;
    type: EngineType;
    port: keyof EnginePortMap[EngineType];
};

export type Connection = {
    from: Terminal;
    to: Terminal;
};

const [connections, setConnections] = createSignal<Connection[]>([]);

export function addConnection(connection: Connection) {
    setConnections((prev) => [...prev, connection]);
}

export function removeConnection(connection: Connection) {
    setConnections((prev) =>
        prev.filter(
            (c) =>
                !(c.from.id === connection.from.id && c.from.port === connection.from.port && c.to.id === connection.to.id && c.to.port === connection.to.port)
        )
    );
}

export function getConnections(): Connection[] {
    return connections();
}

export function clearConnections() {
    setConnections([]);
}
