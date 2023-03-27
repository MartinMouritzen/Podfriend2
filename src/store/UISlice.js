export const createUISlice = (set, get) => ({
	desktop: false,
	setDesktop: (desktop) => {
		set({
			desktop: desktop
		});
	},
	maximized: false,
	setMaximized: (maximized) => {
		var desktop = get().desktop;

		if (!maximized) {
			desktop.minimize();
		}
		else {
			desktop.maximize();
		}
	},
	closeApplication: () => {
		console.log('close 1');
		var desktop = get().desktop;
		desktop.closeApplication();
	}
});