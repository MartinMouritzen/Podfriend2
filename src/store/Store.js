import { create } from 'zustand';
import produce from 'immer';

// import { IDBStorage } from './IDBStorage';

import { persist, createJSONStorage } from 'zustand/middleware';

import { createPodcastSlice } from './PodcastSlice';
import { createPlayerSlice } from './PlayerSlice';
import { createUserSlice } from './UserSlice';
import { createUISlice } from './UISlice';
import { createWalletSlice } from './WalletSlice';
import { createPlaylistSlice } from './PlaylistSlice';
import { createReviewSlice } from './ReviewSlice';
import { createServerSyncSlice } from './ServerSyncSlice';
import { createSettingsSlice } from './SettingsSlice';

// import { get, set } from "idb-keyval";

import { get, set, del } from 'idb-keyval' // can use anything: IndexedDB, Ionic Storage, etc.

// Custom storage object
const storage = {
  getItem: async (name) => {
    return (await get(name)) || null
  },
  setItem: async (name, value) => {
	set(name, value);
	/*
	console.log('%cSetting item', 'background: #CECECE; color: #999999, padding: 2px;');
	try {
    	await set(name, value)
	}
	catch(exception) {
		console.log(exception);
	}
	*/
  },
  removeItem: async (name) => {
    await del(name)
  },
}

/*
const IDBStorage = {
  getItem: async (name) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return null;
    }

    const value = await get(name);

    console.log("load indexeddb called");
    return value || null;
  },
  setItem: async (name, value) => {
    // Exit early on server
    if (typeof indexedDB === "undefined") {
      return;
    }
    set(name, value);
  },
};
*/

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
	...createReviewSlice(...a),
	...createServerSyncSlice(...a),
	...createSettingsSlice(...a),
	_hasHydrated: false
}),{
	name: 'podfriend-v1',
	storage: createJSONStorage(() => { return storage; }),
	onRehydrateStorage: () => () => {
		useStore.setState({ _hasHydrated: true })
	},
	// Define what parts we do not want persisted
	partialize: (state) => {
		let newState = {...state};
		delete newState._hasHydrated;
		delete newState.audioController;
		delete newState.desktop;
		delete newState.shouldPlay;
		delete newState.playerFullscreen;

		delete newState.showingLoginModal;

		delete newState.synchronizingEpisodeState;

		delete newState.isBoosting;

		return newState;
	}
}))


export default useStore;