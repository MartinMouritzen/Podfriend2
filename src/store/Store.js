import create from 'zustand';
import produce from 'immer';

// import { IDBStorage } from './IDBStorage';

import { persist, createJSONStorage } from 'zustand/middleware';

import { createPodcastSlice } from './PodcastSlice';
import { createPlayerSlice } from './PlayerSlice';
import { createUserSlice } from './UserSlice';
import { createUISlice } from './UISlice';
import { createWalletSlice } from './WalletSlice';
import { createPlaylistSlice } from './PlaylistSlice';
import { createServerSyncSlice } from './ServerSyncSlice';

// import { get, set } from "idb-keyval";

import { get, set, del } from 'idb-keyval' // can use anything: IndexedDB, Ionic Storage, etc.

// Custom storage object
const storage = {
  getItem: async (name) => {
    return (await get(name)) || null
  },
  setItem: async (name, value) => {
    await set(name, value)
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
	...createServerSyncSlice(...a)
}),{
	name: 'podfriend-v1',
	storage: createJSONStorage(() => { return storage; }),
	// Define what parts we do not want persisted
	partialize: (state) => {
		let newState = {...state};
		delete newState.audioController;
		delete newState.desktop;
		delete newState.shouldPlay;
		delete newState.playerFullscreen;

		return newState;
	}
}))


export default useStore;