import create from 'zustand';
import produce from 'immer';

import { persist } from 'zustand/middleware';

import { createPodcastSlice } from './PodcastSlice';
import { createPlayerSlice } from './PlayerSlice';
import { createUserSlice } from './UserSlice';


/*
const useStore = create(persist((set,get) => ({

})))
*/
const useStore = create(persist((...a) => ({
	...createPodcastSlice(...a),
	...createPlayerSlice(...a),
	...createUserSlice(...a),
}),{
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