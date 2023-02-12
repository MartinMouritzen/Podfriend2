// import { windowsStore } from 'process';
import { createRoot } from 'react-dom/client';
import App from './App';

import WebAudioController from "library/AudioController/WebAudioController";

const container = document.getElementById('root');
const root = createRoot(container);

const audioController = new WebAudioController();

root.render(<App platform="web" audioController={audioController} />);