import create from 'zustand';
import produce from 'immer';

import { IDBStorage } from './IDBStorage';

import { persist, createJSONStorage } from 'zustand/middleware';

import { createPodcastSlice } from './PodcastSlice';
import { createPlayerSlice } from './PlayerSlice';
import { createUserSlice } from './UserSlice';
import { createUISlice } from './UISlice';
import { createWalletSlice } from './WalletSlice';
import { createPlaylistSlice } from './PlaylistSlice';
import { createServerSyncSlice } from './ServerSyncSlice';

/*
const useStore = create(persist((set,get) => ({

})))
*/
const useStore = create(persist((...a) => ({
	...createPodcastSlice(...a),
	...createPlayerSlice(...a),
	...createUserSlice(...a),
	...createUISlice(...a),
	...createPlaylistSlice(...a),
	...createWalletSlice(...a),
	...createServerSyncSlice(...a)
}),{
	name: 'podfriend-v1',
	// Define what parts we do not want persisted
	partialize: (state) => {
		let newState = {...state};
		delete newState.audioController;
		delete newState.shouldPlay;
		delete newState.playerFullscreen;
		delete newState.audioController;

		return newState;
	}
}))


export default useStore;