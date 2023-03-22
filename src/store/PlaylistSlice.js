export const createPlaylistSlice = (set,get) => ({
	playlists: [
		{
			name: 'default',
			type: 'manual'

		}
	],
	addEpisodeToPlaylistStart: () => {
		console.log('addEpisodeToPlaylistStart');
	},
	addEpisodeToPlaylistEnd: () => {
		console.log('addEpisodeToPlaylistEnd');
	},
});