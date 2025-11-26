import { createContext, useContext, createSignal } from "solid-js";

// Context value type
interface WebAudioContextValue {
    audioCtx: AudioContext;
    state: () => AudioContextState;
    resume: () => Promise<void>;
}

// Create the context
export const WebAudioContext = createContext<WebAudioContextValue>();

interface WebAudioProviderProps {
    children: any;
}

export function WebAudioProvider(props: WebAudioProviderProps) {
    const audioCtx = new window.AudioContext();
    const [state, setState] = createSignal<AudioContextState>(audioCtx.state);

    audioCtx.onstatechange = () => setState(audioCtx.state);

    async function resume() {
        await audioCtx.resume();
        setState(audioCtx.state);
    }

    const value: WebAudioContextValue = {
        audioCtx,
        state,
        resume,
    };

    return <WebAudioContext.Provider value={value}>{props.children}</WebAudioContext.Provider>;
}

export function useWebAudioContext() {
    const ctx = useContext(WebAudioContext);
    if (!ctx) throw new Error("WebAudioContext not found");
    return ctx;
}
