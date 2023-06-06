import produce from 'immer';

export const createSettingsSlice = (set, get) => ({
	settings: {
		autoContinue: true
	},
	setSetting: (key,value) => {
		set(
			produce((state) => {
				state.settings[key] = value;
			})
		)
	}
});