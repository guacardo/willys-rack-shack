import styles from "./WAK.LFO.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { LFOEngine, type LFOPorts } from "@/audio/lfo.engine";
import { getEngineById } from "@/stores/engines.store";
import { WAKConnectionIndicator } from "../connection-indicator/WAK.connection-indicator";
import { getPortStatus } from "@/stores/connections.store";

export interface WAKLFOProps {
    id: string;
}

export function WAKLFO({ id }: WAKLFOProps) {
    const engine = () => getEngineById(id) as LFOEngine | undefined;

    const frequency = () => engine()?.frequencySignal[0]() ?? 1;
    const detune = () => engine()?.detuneSignal[0]() ?? 0;
    const depth = () => engine()?.depthSignal[0]() ?? 1;
    const type = () => engine()?.typeSignal[0]() ?? "sine";

    const handleParamChange = (param: "frequency" | "detune" | "depth" | "type") => (e: Event) => {
        e.stopPropagation();
        const value = param === "type" ? (e.target as HTMLSelectElement).value : Number((e.target as HTMLInputElement).value);
        engine()?.setAudioParams({ [param]: value });
    };

    return (
        <div class={styles.lfo}>
            <WUTText variant="subheader">{engine()?.name}</WUTText>
            <label>
                <input type="range" min="0.01" max="200" step="0.01" value={frequency()} onInput={handleParamChange("frequency")} />
                <div class={styles["control"]}>
                    <WUTText variant="number">{frequency().toFixed(2)}</WUTText>
                    <WUTText variant="unit">hz</WUTText>
                </div>
            </label>
            <label>
                <input type="range" min="-1200" max="1200" value={detune()} onInput={handleParamChange("detune")} />
                <div class={styles["control"]}>
                    <WUTText variant="number">{detune()}</WUTText>
                    <WUTText variant="unit">ct</WUTText>
                </div>
            </label>
            <label>
                <input type="range" min="0" max="400" step="1" value={depth()} onInput={handleParamChange("depth")} />
                <div class={styles["control"]}>
                    <WUTText variant="number">{depth().toFixed(2)}</WUTText>
                    <WUTText variant="unit">depth</WUTText>
                </div>
            </label>
            <label>
                <WUTText variant="label">Type:</WUTText>
                <select value={type()} onChange={handleParamChange("type")}>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                </select>
            </label>
            <div class={styles["ports"]}>
                {engine() &&
                    Object.entries(engine()!.ports).map(([portName, _]) => {
                        const status = getPortStatus({
                            id: engine()!.id,
                            type: engine()!.engineType,
                            port: portName as keyof LFOPorts,
                        });
                        return <WAKConnectionIndicator label={portName} status={status} />;
                    })}
            </div>
        </div>
    );
}
