import { createContext, useContext, createSignal } from "solid-js";

interface WebAudioContextValue {
    audioCtx: AudioContext;
    state: () => AudioContextState;
    resume: () => Promise<void>;
}

const WebAudioContext = createContext<WebAudioContextValue>();

interface WebAudioProviderProps {
    children: any;
}

let GLOBAL_AUDIO_CTX: AudioContext;

export function WebAudioProvider(props: WebAudioProviderProps) {
    const audioCtx = new window.AudioContext();
    GLOBAL_AUDIO_CTX = audioCtx;
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

export function getAudioContext(): AudioContext {
    if (!GLOBAL_AUDIO_CTX) {
        throw new Error("Global AudioContext not initialized. Make sure to wrap your app with WebAudioProvider.");
    }
    return GLOBAL_AUDIO_CTX;
}
