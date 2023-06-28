
import { Capacitor } from '@capacitor/core'
import { BackgroundMode } from '@ionic-native/background-mode';

import { createRoot } from 'react-dom/client';
import App from './App';

import WebAudioController from "library/AudioController/WebAudioController";
import NativeAudioController from "library/AudioController/WebAudioController";

const container = document.getElementById('root');
const root = createRoot(container);

const audioController = (Capacitor.isNative) ? new NativeMobileAudioController() : new WebAudioController();
audioController.startService();
audioController.init();

if (Capacitor.isNative) {
	console.log('Is native');
	document.addEventListener('deviceready', function () {
		console.log('Setting Podfriend permissions to also run in the background');
		this.backgroundMode.setDefaults({
			title: 'Podfriend',
			text: 'Podcast player',
			resume: true,
			hidden: false,
			silent: false
		});

		this.backgroundMode.enable();
	});
}

root.render(<App platform="web" audioController={audioController} />);