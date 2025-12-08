import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { OscillatorEngine, type OscillatorPorts } from "@/audio/oscillator.engine";
import { getEngineById } from "@/stores/engines.store";
import { createSignal, createEffect, onCleanup } from "solid-js";
import { WAKConnectionIndicator } from "../connection-indicator/WAK.connection-indicator";

export interface WAKOscillatorProps {
    id: string;
}

export function WAKOscillator({ id }: WAKOscillatorProps) {
    const engine = () => getEngineById(id) as OscillatorEngine | undefined;

    // Local signals for display values
    const [frequency, setFrequency] = createSignal(engine()?.getFrequency() ?? 440);
    const [detune, setDetune] = createSignal(engine()?.getDetune() ?? 0);
    const [type, setType] = createSignal(engine()?.getType() ?? "sine");

    // Poll the engine for current values
    // todo, observer/visitor pattern for polling all active audio engines
    let poller: number | undefined;
    createEffect(() => {
        if (poller) clearInterval(poller);

        const eng = engine();
        if (eng) {
            poller = setInterval(() => {
                setFrequency(eng.getFrequency());
                setDetune(eng.getDetune());
                setType(eng.getType());
            }, 30);
        }

        onCleanup(() => poller && clearInterval(poller));
    });

    const handleParamChange = (param: "frequency" | "detune" | "type") => (e: Event) => {
        e.stopPropagation();
        const value = param === "type" ? (e.target as HTMLSelectElement).value : Number((e.target as HTMLInputElement).value);
        engine()?.setAudioParams({ [param]: value });
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
                    Object.entries(engine()!.ports).map(([portName, _]) => (
                        <WAKConnectionIndicator label={portName} status={engine()?.isPortConnected(portName as keyof OscillatorPorts) ? "on" : "off"} />
                    ))}
            </div>
        </div>
    );
}
