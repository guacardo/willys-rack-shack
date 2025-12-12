import { addConnection, removeConnection, getConnections, type Connection, type Terminal } from "@/stores/connections.store";
import { getEngineById } from "@/stores/engines.store";
import { getMembersOfGroup } from "@/stores/groups.store";
import { getAudioContext } from "@/stores/web-audio-context.store";
import type { IAudioEngine } from "@/audio/engine";

export class AudioConnectionService {
    /**
     * Connect two engines together, handling both Web Audio routing and store state
     */
    connect(from: Terminal, to: Terminal): boolean {
        const fromEngine = getEngineById(from.id);
        const toEngine = to.id === "destination" ? null : getEngineById(to.id);

        if (!fromEngine) {
            console.error("Source engine not found");
            return false;
        }

        const fromPortNode = fromEngine.ports[from.port];

        if (!fromPortNode) {
            console.error("Source port not found");
            return false;
        }

        if (!(fromPortNode instanceof AudioNode)) {
            console.error("Source port must be an AudioNode");
            return false;
        }

        // Handle destination connection
        if (to.id === "destination") {
            const audioCtx = getAudioContext();
            fromPortNode.connect(audioCtx.destination);
        } else if (toEngine) {
            const toPortNode = toEngine.ports[to.port];

            if (!toPortNode) {
                console.error("Destination port not found");
                return false;
            }

            // Connect directly using Web Audio API - works for both AudioNode and AudioParam
            fromPortNode.connect(toPortNode);
        } else {
            console.error("Destination engine not found");
            return false;
        }

        // Update store
        const connection: Connection = { from, to };
        addConnection(connection);

        return true;
    }

    /**
     * Disconnect engines
     */
    disconnect(connection: Connection): boolean {
        const fromEngine = getEngineById(connection.from.id);
        const toEngine = connection.to.id === "destination" ? null : getEngineById(connection.to.id);

        if (fromEngine && fromEngine.ports && connection.from.port in fromEngine.ports) {
            const fromPort = fromEngine.ports[connection.from.port];

            if (fromPort instanceof AudioNode) {
                if (connection.to.id === "destination") {
                    // Disconnect from audio destination
                    const audioCtx = getAudioContext();
                    try {
                        fromPort.disconnect(audioCtx.destination);
                    } catch (e) {
                        fromPort.disconnect();
                    }
                } else if (toEngine && toEngine.ports && connection.to.port in toEngine.ports) {
                    const toPort = toEngine.ports[connection.to.port];
                    try {
                        fromPort.disconnect(toPort);
                    } catch (e) {
                        fromPort.disconnect();
                    }
                } else {
                    fromPort.disconnect();
                }
            }
        }

        // Update store
        removeConnection(connection);
        return true;
    }

    /**
     * Auto-connect engines in a group (e.g., oscillators -> gain -> destination)
     */
    syncGroupConnections(groupId: string): void {
        console.log("groupId in syncGroupConnections:", groupId);
        const memberIds = getMembersOfGroup(groupId);
        const engines = memberIds.map((id) => getEngineById(id)).filter((e): e is IAudioEngine<any, any> => e !== undefined);

        // Find sources (oscillators) and gains
        const sources = engines.filter((e) => e.engineType === "oscillator");
        const gains = engines.filter((e) => e.engineType === "gain");

        // Only auto-connect if this is a "source group" (has both sources and gains)
        if (sources.length > 0 && gains.length > 0) {
            const outputGain = gains[0];
            const allConnections = getConnections();

            // Connect all sources to the output gain
            sources.forEach((source) => {
                const from: Terminal = { id: source.id, type: "oscillator", port: "output" };
                const to: Terminal = { id: outputGain.id, type: "gain", port: "input" };

                const exists = allConnections.some((c) => c.from.id === from.id && c.from.port === from.port && c.to.id === to.id && c.to.port === to.port);

                if (!exists) {
                    this.connect(from, to);
                }
            });

            // Connect output gain to audio destination
            const from: Terminal = { id: outputGain.id, type: "gain", port: "output" };
            const to: Terminal = { id: "destination", type: "destination", port: "input" };

            const destExists = allConnections.some((c) => c.from.id === from.id && c.from.port === from.port && c.to.id === to.id);

            if (!destExists) {
                this.connect(from, to);
            }
        }
    }
}

// Export singleton instance
export const audioConnectionService = new AudioConnectionService();
