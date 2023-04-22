import { windowsStore } from 'process';
import { createRoot } from 'react-dom/client';
import App from './App';

import Events from 'library/Events.js';

const container = document.getElementById('root');
const root = createRoot(container);

import WebAudioController from "library/AudioController/WebAudioController";

let animationId;
let mouseX;
let mouseY;

let windowMoving = false;
let listenToWindowMove = false;

window.Events = Events;

function onDoubleClick(event) {
	for(var i=0;i<event.path.length;i++) {
		if (event.path[i] && event.path[i].classList && event.path[i].classList.contains('mainToolbar')) {
			window.electron.ipcRenderer.sendMessage('windowMaximizeRequested');
		}
	}
}
function onMouseDown(event) {
	for(var i=0;i<event.path.length;i++) {
		if (event.path[i] && event.path[i].classList && event.path[i].classList.contains('mainToolbar')) {
			mouseX = event.clientX;  
			mouseY = event.clientY;
			
			listenToWindowMove = true;

			window.electron.ipcRenderer.sendMessage('windowMoveStarted');

			requestAnimationFrame(moveWindow);
		}
	}
}

function onMouseUp(e) {
	if (windowMoving) {
		cancelAnimationFrame(animationId);
	}
	listenToWindowMove = false;
	windowMoving = false;
}

function moveWindow() {
	if (listenToWindowMove) {
		windowMoving = true;
		window.electron.ipcRenderer.sendMessage('windowMoving', { mouseX, mouseY });
		animationId = requestAnimationFrame(moveWindow);
	}
}

document.addEventListener('dblclick',onDoubleClick);
document.addEventListener('mousedown',onMouseDown);
document.addEventListener('mouseup',onMouseUp);

const audioController = new WebAudioController();
audioController.browserShortcutsEnabled = false;

const desktop = {
	maximize: () => {
		window.electron.ipcRenderer.sendMessage('windowMaximizeRequested');
	},
	restore: () => {
		window.electron.ipcRenderer.sendMessage('windowMaximizeRequested');
	},
	minimize: () => {
		window.electron.ipcRenderer.sendMessage('windowMinimizeRequested');
	},
	closeApplication: () => {
		window.electron.ipcRenderer.sendMessage('windowCloseRequested');
	}
};

// window.electron.ipcRenderer

root.render(<App platform="desktop" audioController={audioController} desktop={desktop} />);


/*
if (window.electron) {
	// calling IPC exposed from preload script
	window.electron.ipcRenderer.once('ipc-example', (arg) => {
		// eslint-disable-next-line no-console
		console.log(arg);
	});
	window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
}
*/