export const EngineType = {
    Oscillator: "oscillator",
    Gain: "gain",
} as const;

export type EngineType = (typeof EngineType)[keyof typeof EngineType];
export interface IAudioEngine {
    id: string;
    name: string;
    ctx: AudioContext;
    ports: Record<string, AudioNode | AudioParam>;
    engineType: EngineType;
    connect(node: AudioNode | AudioParam): void;
    disconnect(): void;
    update(updates: Partial<this>): this;
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
