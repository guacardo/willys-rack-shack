import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { OscillatorEngine, type OscillatorPorts } from "@/audio/oscillator.engine";
import { getEngineById } from "@/stores/engines.store";
import { WAKConnectionIndicator } from "../connection-indicator/WAK.connection-indicator";
import { isPortConnected, connectionsMap, terminalToKey } from "@/stores/connections.store";

export interface WAKOscillatorProps {
    id: string;
}

export function WAKOscillator({ id }: WAKOscillatorProps) {
    const engine = () => getEngineById(id) as OscillatorEngine | undefined;

    const frequency = () => engine()?.frequencySignal[0]() ?? 440;
    const detune = () => engine()?.detuneSignal[0]() ?? 0;
    const dutyCycle = () => engine()?.dutyCycleSignal[0]() ?? 0.5;
    const type = () => engine()?.typeSignal[0]() ?? "sine";

    const handleParamChange = (param: "frequency" | "detune" | "type") => (e: Event) => {
        e.stopPropagation();
        const value = param === "type" ? (e.target as HTMLSelectElement).value : Number((e.target as HTMLInputElement).value);
        engine()?.setAudioParams({ [param]: value });
    };

    const handleDutyCycleChange = (e: Event) => {
        e.stopPropagation();
        const value = Number((e.target as HTMLInputElement).value);
        engine()?.setPulseWave(value);
    };

    return (
        <div class={styles.oscillator}>
            <WUTText variant="subheader">{engine()?.name}</WUTText>
            <label>
                <input type="range" min="50" max="2000" value={frequency()} onInput={handleParamChange("frequency")} />
                <div class={styles["control"]}>
                    <WUTText variant="number">{frequency()}</WUTText>
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
                <input type="range" min="0.01" max="0.99" step="0.01" value={dutyCycle()} onInput={handleDutyCycleChange} />
                <div class={styles["control"]}>
                    <WUTText variant="number">{dutyCycle().toFixed(2)}</WUTText>
                    <WUTText variant="unit">duty</WUTText>
                </div>
            </label>
            <label>
                <WUTText variant="label">Type:</WUTText>
                <select value={type()} onChange={handleParamChange("type")}>
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="sawtooth">Sawtooth</option>
                    <option value="triangle">Triangle</option>
                    <option value="custom" disabled>
                        Custom
                    </option>
                </select>
            </label>
            <div class={styles["ports"]}>
                {engine() &&
                    Object.entries(engine()!.ports).map(([portName, _]) => {
                        const termKey = terminalToKey({
                            id: engine()!.id,
                            type: engine()!.engineType,
                            port: portName as keyof OscillatorPorts,
                        });
                        const map = connectionsMap();
                        let status: "on" | "off" | "who-knows" = "who-knows";
                        if (map.has(termKey)) {
                            status = isPortConnected({
                                id: engine()!.id,
                                type: engine()!.engineType,
                                port: portName as keyof OscillatorPorts,
                            })
                                ? "on"
                                : "off";
                        }
                        return <WAKConnectionIndicator label={portName} status={status} />;
                    })}
            </div>
        </div>
    );
}
