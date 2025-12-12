import { removeAllConnectionsForEngine } from "@/stores/connections.store";
import { removeMember } from "@/stores/groups.store";

export const EngineType = {
    oscillator: "Oscillator",
    gain: "Gain",
} as const;

export type EngineTypeKey = keyof typeof EngineType;
export type EngineTypeValue = (typeof EngineType)[keyof typeof EngineType];
export interface IAudioEngine<T extends AudioNode, P extends Record<string, AudioNode | AudioParam>> {
    id: string;
    name: string;
    ctx: AudioContext;
    ports: P;
    engineType: EngineTypeKey;
    setAudioParams(
        props: Partial<{
            [K in keyof T]: T[K] extends AudioParam ? number | [number, number] : T[K];
        }>
    ): void;
    connect(node: AudioNode | AudioParam): void;
    disconnect(): void;
    modulate(portName: keyof P, modulator: AudioNode): void;
    tick(): void;
    cleanup(): void;
}

export function updateAudioParamValue<T extends AudioNode>(
    context: AudioContext,
    node: T,
    properties: Partial<{
        [K in keyof T]: T[K] extends AudioParam ? number | [number, number] : T[K];
    }>
): T {
    for (const [property, value] of Object.entries(properties)) {
        if (property in node) {
            const propKey = property as keyof T;
            if (node[propKey] instanceof AudioParam) {
                if (Array.isArray(value)) {
                    const [targetValue, rampTime] = value;
                    node[propKey].linearRampToValueAtTime(targetValue, context.currentTime + rampTime);
                } else if (typeof value === "number") {
                    node[propKey].setValueAtTime(value, context.currentTime);
                    node[propKey].value = value;
                } else {
                    console.error(`Invalid value for AudioParam ${value}`);
                }
            } else if (property === "type" && value) {
                node[propKey] = value as any;
            }
        } else {
            console.warn(`Property ${property} not found on node`);
        }
    }

    return node;
}

export function removeEngineFromGroupWithConnections(groupId: string, engineId: string) {
    removeAllConnectionsForEngine(engineId);
    removeMember(groupId, engineId);
}
