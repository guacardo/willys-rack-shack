import { createStore } from "solid-js/store";
import type { IAudioEngine } from "@/audio/engine";

const [modules, setModules] = createStore<IAudioEngine[]>([]);

export { modules, setModules };
