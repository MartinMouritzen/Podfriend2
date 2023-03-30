import { useEffect } from 'react';
import useStore from 'store/Store';

const DesktopHeader = () => {
	const maximized = useStore((state) => state.maximized);
	const requestMinimize = useStore((state) => state.requestMinimize);
	const requestMaximize = useStore((state) => state.requestMaximize);
	const setMaximizedStatus = useStore((state) => state.setMaximizedStatus);
	const closeApplication = useStore((state) => state.closeApplication);


	useEffect(() => {
		console.log('requesting window status');
		window.electron.ipcRenderer.sendMessage('windowStatusRequested');

		window.electron.ipcRenderer.on('window-status',(windowStatus) => {
			setMaximizedStatus(windowStatus.maximized);
		});
	},[]);
	/*
	useEffect(() => {
		if (isAppElectron) {
			var remote = require('electron').remote; // setRemote(require('electron').remote);

			var electronWindow = remote.getCurrentWindow();
			setAppWindow(electronWindow);

			electronWindow.on('maximize',() => {
				setMaximized(true);
			});
			electronWindow.on('unmaximize',() => {
				setMaximized(false);
			});
		}
	},[isAppElectron]);
	*/

	const onMinimize = () => {
		requestMinimize();
	}
	const onMaximizeOrNormalize = () => {
		requestMaximize();
	}
	const onClose = () => {
		closeApplication();
	}

	return (
		<div className="desktopHeader" style={{ display: 'flex' }}>
			<div onClick={onMinimize} className="windowControlButton minimizeButton"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 352H48c-26.5 0-48 21.5-48 48v32c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-32c0-26.5-21.5-48-48-48z"></path></svg></div>
			{ !maximized &&
				<div onClick={onMaximizeOrNormalize} className="windowControlButton maximizeButton"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm0 394c0 3.3-2.7 6-6 6H54c-3.3 0-6-2.7-6-6V192h416v234z"></path></svg></div>
			}
			{ maximized &&
				<div onClick={onMaximizeOrNormalize} className="windowControlButton restoreButton"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M512 48v288c0 26.5-21.5 48-48 48h-48V176c0-44.1-35.9-80-80-80H128V48c0-26.5 21.5-48 48-48h288c26.5 0 48 21.5 48 48zM384 176v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48h288c26.5 0 48 21.5 48 48zm-68 28c0-6.6-5.4-12-12-12H76c-6.6 0-12 5.4-12 12v52h252v-52z"></path></svg></div>
			}
			<div onClick={onClose} className="windowControlButton closeButton"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M464 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-83.6 290.5c4.8 4.8 4.8 12.6 0 17.4l-40.5 40.5c-4.8 4.8-12.6 4.8-17.4 0L256 313.3l-66.5 67.1c-4.8 4.8-12.6 4.8-17.4 0l-40.5-40.5c-4.8-4.8-4.8-12.6 0-17.4l67.1-66.5-67.1-66.5c-4.8-4.8-4.8-12.6 0-17.4l40.5-40.5c4.8-4.8 12.6-4.8 17.4 0l66.5 67.1 66.5-67.1c4.8-4.8 12.6-4.8 17.4 0l40.5 40.5c4.8 4.8 4.8 12.6 0 17.4L313.3 256l67.1 66.5z"></path></svg></div>
		</div>
	);
}
export default DesktopHeader;