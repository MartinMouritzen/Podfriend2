
import { Capacitor } from '@capacitor/core'
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';

import { createRoot } from 'react-dom/client';
import App from './App';

import WebAudioController from "library/AudioController/WebAudioController.js";
// import NativeMobileAudioController from "library/AudioController/NativeMobileAudioController";
import HybridMobileAudioController from "library/AudioController/HybridMobileAudioController.js";

const container = document.getElementById('root');
const root = createRoot(container);

let audioController = Capacitor.isNative ? new HybridMobileAudioController() : new WebAudioController();
audioController.startService();
audioController.init();

if (Capacitor.isNative) {
	console.log('Setting Podfriend permissions to also run in the background');
	BackgroundMode.setDefaults({
		title: 'Podfriend',
		text: 'Podcast player',
		resume: true,
		hidden: false,
		silent: false
	});

	BackgroundMode.enable();
}

root.render(<App platform="web" audioController={audioController} />);