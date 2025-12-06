import type { OscillatorPorts } from "@/audio/oscillator.engine";
import type { GainPorts } from "@/audio/gain.engine";
import type { EngineType } from "@/audio/engine";
import { createSignal } from "solid-js";
import { getEngineById } from "./engines.store";
import { getMembersOfGroup } from "./groups.store";
import { getAudioContext } from "@/contexts/web-audio-context";

type EnginePortMap = {
    oscillator: keyof OscillatorPorts;
    gain: keyof GainPorts;
};

type Terminal = {
    id: string;
    type: EngineType;
    port: EnginePortMap[EngineType];
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
    // todo: call each engine's disconnect method (remove from web audio graph), then remove from store.
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

export function syncGroupConnections(groupId: string) {
    const audioCtx = getAudioContext();
    const memberIds = getMembersOfGroup(groupId);
    const engines = memberIds.map((id) => getEngineById(id)).filter((e) => e !== undefined);

    // Find sources (oscillators) and gains
    const sources = engines.filter((e) => e.engineType === "oscillator");
    const gains = engines.filter((e) => e.engineType === "gain");

    // Only auto-connect if this is a "source group" (has both sources and gains)
    if (sources.length > 0 && gains.length > 0) {
        const outputGain = gains[0]; // First gain is the output gain

        // Connect all sources to the output gain
        sources.forEach((source) => {
            const connection: Connection = {
                from: { id: source.id, type: "oscillator", port: "output" },
                to: { id: outputGain.id, type: "gain", port: "input" },
            };

            // Check if connection already exists
            const exists = connections().some(
                (c) =>
                    c.from.id === connection.from.id && c.from.port === connection.from.port && c.to.id === connection.to.id && c.to.port === connection.to.port
            );

            if (!exists) {
                addConnection(connection);
                // Actually connect the Web Audio nodes
                source.connect(outputGain.ports.input as AudioNode);
            }
        });

        // Connect output gain to audio destination
        const destConnection: Connection = {
            from: { id: outputGain.id, type: "gain", port: "output" },
            to: { id: "destination", type: "gain", port: "input" }, // Special ID for destination
        };

        const destExists = connections().some(
            (c) => c.from.id === destConnection.from.id && c.from.port === destConnection.from.port && c.to.id === destConnection.to.id
        );

        if (!destExists) {
            addConnection(destConnection);
            outputGain.connect(audioCtx.destination);
        }
    }
}

export { connections };
