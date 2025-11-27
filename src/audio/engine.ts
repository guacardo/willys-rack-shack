export interface IAudioEngine {
    ctx: AudioContext;
    ports: Record<string, AudioNode | AudioParam>;
    connect(node: AudioNode | AudioParam): void;
    disconnect(): void;
}
