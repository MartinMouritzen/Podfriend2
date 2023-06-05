
import { Capacitor } from '@capacitor/core'

import { createRoot } from 'react-dom/client';
import App from './App';

import WebAudioController from "library/AudioController/WebAudioController";
import NativeAudioController from "library/AudioController/WebAudioController";

const container = document.getElementById('root');
const root = createRoot(container);

const audioController = new WebAudioController();
// const audioController = (Capacitor.isNative) ? new NativeMobileAudioController() : new WebAudioController();
audioController.startService();
audioController.init();

root.render(<App platform="web" audioController={audioController} />);