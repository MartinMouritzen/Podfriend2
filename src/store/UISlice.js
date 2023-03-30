export const createUISlice = (set, get) => ({
	desktop: false,
	setDesktop: (desktop) => {
		set({
			desktop: desktop
		});
	},
	maximized: false,
	requestMaximize: (maximized) => {
		var desktop = get().desktop;
		desktop.maximize();
	},
	requestMinimize: () => {
		var desktop = get().desktop;
		desktop.minimize();
	},
	setMaximizedStatus: (maximized) => {
		set({
			maximized: maximized
		});
	},
	closeApplication: () => {
		var desktop = get().desktop;
		desktop.closeApplication();
	},
	latestSearches: []
});