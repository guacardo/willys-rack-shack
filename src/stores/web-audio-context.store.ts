import { createSignal } from "solid-js";

// Singleton AudioContext
let audioCtx: AudioContext | undefined = undefined;

// Signal for AudioContext state
const [state, setState] = createSignal<AudioContextState>("suspended");

function getAudioContext(): AudioContext {
    if (!audioCtx) {
        audioCtx = new window.AudioContext();
        setState(audioCtx.state);
        audioCtx.onstatechange = () => setState(audioCtx!.state);
    }
    return audioCtx;
}

function getAudioContextState(): AudioContextState {
    return state();
}

async function resumeAudioContext(): Promise<void> {
    const ctx = getAudioContext();
    await ctx.resume();
    setState(ctx.state);
}

export { getAudioContext, getAudioContextState, resumeAudioContext };
