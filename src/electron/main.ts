/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, screen, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// Disables the default media keys, which are not very reliable in an electron environment
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');

class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}

let mainWindow: BrowserWindow | null = null;

let windowBounds: any = null;

const getWindowStatus = () => {
	return {
		maximized: mainWindow?.isMaximized()
	};
};

let mediaKeysEnabled = true;

const disableMediaKeys = () => {
	mediaKeysEnabled = false;
	globalShortcut.unregister('VolumeUp');
	globalShortcut.unregister('VolumeDown');
	globalShortcut.unregister('VolumeMute');
	globalShortcut.unregister('MediaPlayPause');
	globalShortcut.unregister('MediaStop');
	globalShortcut.unregister('MediaNextTrack');
	globalShortcut.unregister('MediaPreviousTrack');

};
const enableMediaKeys = () => {
	mediaKeysEnabled = true;
	/*
	globalShortcut.register('VolumeUp', () => {
		console.log('VolumeUp');
		// console.log(audio.getVolume());

		var volume = audio.getVolume();
		
		if (volume.then) {
			volume.then((volume) => {
				audio.setVolume(volume + 2);
			});
		}
		else {
			audio.setVolume(volume + 2);
		}
		
		// mainWindow.webContents.executeJavaScript('Events.emit(\'VolumeUp\',false)');
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'VolumeUp\',false)');
	});
	
	globalShortcut.register('VolumeDown', () => {
		console.log('VolumeDown');

		var volume = audio.getVolume();
		
		if (volume.then) {
			volume.then((existingVolume) => {
				audio.setVolume(existingVolume - 2);
			});
		}
		else {
			audio.setVolume(volume - 2);
		}
		// mainWindow.webContents.executeJavaScript('Events.emit(\'VolumeDown\',false)');
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'VolumeDown\',false)');
	});
	
	globalShortcut.register('VolumeMute', () => {
		console.log('VolumeMute');
		
		var mutedStatus = audio.isMuted();
		
		if (mutedStatus.then) {
			mutedStatus.then((existingMutedStatus) => {
				audio.setMuted(!existingMutedStatus);
			});
		}
		else {
			audio.setMuted(!mutedStatus);
		}

		// mainWindow.webContents.executeJavaScript('Events.emit(\'VolumeMute\',false)');
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'VolumeMute\',false)');
	});
	*/
	
	globalShortcut.register('MediaPlayPause', () => {
		// console.log('MediaPlayPause');
		// playPause();
		
		if (mediaKeysEnabled) {
			mainWindow?.webContents.executeJavaScript('Events.emit(\'MediaPlayPause\',false)');
		}
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'MediaPlayPause\',false)');
	});
	
	globalShortcut.register('MediaStop', () => {
		console.log('MediaStop - BUT - we are sending playpause for now.');
		// playPause();
		// mainWindow.webContents.executeJavaScript('Events.emit(\'MediaStop\',false)');
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'MediaStop\',false)');
		if (mediaKeysEnabled) {
			mainWindow?.webContents.executeJavaScript('Events.emit(\'MediaPlayPause\',false)');
		}
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'MediaPlayPause\',false)');
	});
	
	globalShortcut.register('MediaNextTrack', () => {
		console.log('MediaNextTrack');
		if (mediaKeysEnabled) {
			mainWindow?.webContents.executeJavaScript('Events.emit(\'MediaNextTrack\',false)');
		}
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'MediaNextTrack\',false)');
		// next();
	});
	
	globalShortcut.register('MediaPreviousTrack', () => {
		if (mediaKeysEnabled) {
			mainWindow?.webContents.executeJavaScript('Events.emit(\'MediaPreviousTrack\',false)');
		}
		// quickViewWindow.webContents.executeJavaScript('Events.emit(\'MediaPreviousTrack\',false)');
		console.log('MediaPreviousTrack');
		// previous();
	});
};

/*
ipcMain.on('ipc-example', async (event, arg) => {
	const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
	console.log(msgTemplate(arg));
	event.reply('ipc-example', msgTemplate('pong'));
});
*/
ipcMain.on('windowStatusRequested', (event) => {
	event.reply('window-status',getWindowStatus());
});
ipcMain.on('windowMaximizeRequested', (event) => {
	if (mainWindow?.isMaximized()) {
		mainWindow?.unmaximize();
	}
	else {
		mainWindow?.maximize();
	}
	event.reply('window-status',getWindowStatus());
});
ipcMain.on('windowMinimizeRequested', (event) => {
	mainWindow?.minimize();
});
ipcMain.on('windowCloseRequested', (event) => {
	mainWindow?.close();
});


ipcMain.on('windowMoveStarted', (event) => {
	if (mainWindow !== null) {
		windowBounds = mainWindow.getBounds();
	}
});
ipcMain.on('windowMoving', (event, {mouseX, mouseY}) => {
	const { x, y } = screen.getCursorScreenPoint();

	if (mainWindow !== null) {
		// On Windows there's a bug that makes the app larger, everytime we call setBounds, because of an error internally in chromium apparently.
		// This has to do with pixel density, so we might be able to loop through the displays and see if we need to adjust
		// https://www.electronjs.org/docs/latest/api/screen
		// screen.getDisplayNearestPoint(point)
		// https://www.electronjs.org/docs/latest/api/structures/display

		mainWindow.setBounds({
			width: windowBounds.width,
			height: windowBounds.height,
			x: x - mouseX,
			y: y - mouseY
		});

		// mainWindow.setPosition(x - mouseX, y - mouseY);
	}
});


if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDebug =
	process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
	require('electron-debug')();
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log);
};

const createWindow = async () => {
	if (isDebug) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, 'assets')
		: path.join(__dirname, '../../assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1024,
		height: 728,
		icon: getAssetPath('icon.png'),
		frame: false,
		webPreferences: {
			preload: app.isPackaged
				? path.join(__dirname, 'preload.js')
				: path.join(__dirname, '../../.erb/dll/preload.js'),
		},
	});

	mainWindow.loadURL(resolveHtmlPath('index.html'));

	mainWindow.webContents.on('new-window', function(e, url) {
		e.preventDefault();
		require('electron').shell.openExternal(url);
	});

	mainWindow.on('ready-to-show', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}

		globalShortcut.register('CommandOrControl+Shift+K', () => {
			mainWindow?.webContents.openDevTools()
		})

		enableMediaKeys();

		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
		}
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	// Open urls in the user's browser
	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url);
		return { action: 'deny' };
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app
	.whenReady()
	.then(() => {
		createWindow();
		app.on('activate', () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (mainWindow === null) createWindow();
		});
	})
	.catch(console.log);
