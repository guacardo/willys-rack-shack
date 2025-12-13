import styles from "./WAK.Oscillator.module.scss";
import { WUTText } from "../../wut/text/WUT.Text";
import { WUTSlider } from "@/components/wut/slider/WUT.Slider";
import { OscillatorEngine, type OscillatorPorts } from "@/audio/oscillator.engine";
import { getEngineById } from "@/stores/engines.store";
import { WAKConnectionIndicator } from "../connection-indicator/WAK.connection-indicator";
import { getPortStatus } from "@/stores/connections.store";

export interface WAKOscillatorProps {
    id: string;
}

export function WAKOscillator({ id }: WAKOscillatorProps) {
    const engine = () => getEngineById(id) as OscillatorEngine | undefined;

    const frequency = () => engine()?.frequencySignal[0]() ?? 440;
    const detune = () => engine()?.detuneSignal[0]() ?? 0;
    const dutyCycle = () => engine()?.dutyCycleSignal[0]() ?? 0.5;
    const type = () => engine()?.typeSignal[0]() ?? "sine";

    const handleFrequencyChange = (value: number) => {
        engine()?.setAudioParams({ frequency: value });
    };

    const handleDetuneChange = (value: number) => {
        engine()?.setAudioParams({ detune: value });
    };

    const handleDutyCycleChange = (value: number) => {
        engine()?.setPulseWave(value);
    };

    const handleTypeChange = (e: Event) => {
        e.stopPropagation();
        const value = (e.target as HTMLSelectElement).value as OscillatorType;
        engine()?.setAudioParams({ type: value });
    };

    const handleFrequencyBlur = (e: FocusEvent) => {
        const value = Number((e.target as HTMLSpanElement).textContent);
        if (!isNaN(value) && value >= 50 && value <= 2000) {
            engine()?.setAudioParams({ frequency: value });
        }
    };

    const handleDetuneBlur = (e: FocusEvent) => {
        const value = Number((e.target as HTMLSpanElement).textContent);
        if (!isNaN(value) && value >= -1200 && value <= 1200) {
            engine()?.setAudioParams({ detune: value });
        }
    };

    const handleDutyCycleBlur = (e: FocusEvent) => {
        const value = Number((e.target as HTMLSpanElement).textContent);
        if (!isNaN(value) && value >= 0.01 && value <= 0.99) {
            engine()?.setPulseWave(value);
        }
    };

    return (
        <div class={styles.oscillator}>
            <WUTText variant="subheader">{engine()?.name}</WUTText>
            <label>
                <WUTSlider min={50} max={2000} orientation="vertical" value={frequency()} onInput={handleFrequencyChange} />
                <div class={styles["control"]}>
                    <WUTText variant="number" contentEditable onBlur={handleFrequencyBlur}>
                        {frequency()}
                    </WUTText>
                    <WUTText variant="unit">hz</WUTText>
                </div>
            </label>
            <label>
                <WUTSlider min={-1200} max={1200} orientation="vertical" value={detune()} onInput={handleDetuneChange} />
                <div class={styles["control"]}>
                    <WUTText variant="number" contentEditable onBlur={handleDetuneBlur}>
                        {detune()}
                    </WUTText>
                    <WUTText variant="unit">ct</WUTText>
                </div>
            </label>
            <label>
                <WUTSlider min={0.01} max={0.99} step={0.01} value={dutyCycle()} onInput={handleDutyCycleChange} />
                <div class={styles["control"]}>
                    <WUTText variant="number" contentEditable onBlur={handleDutyCycleBlur}>
                        {dutyCycle().toFixed(2)}
                    </WUTText>
                    <WUTText variant="unit">duty</WUTText>
                </div>
            </label>
            <label>
                <WUTText variant="label">Type:</WUTText>
                <select value={type()} onChange={handleTypeChange}>
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
                        const status = getPortStatus({
                            id: engine()!.id,
                            type: engine()!.engineType,
                            port: portName as keyof OscillatorPorts,
                        });
                        return <WAKConnectionIndicator label={portName} status={status} />;
                    })}
            </div>
        </div>
    );
}
