import create from 'zustand'
import produce from 'immer';

import defaultTileMap from './defaultTileMap';

import SoundManager from 'renderer/Library/SoundManager';

const changeCurrentPodcast = (podcast) => {
	useStore.setState({ currentPodcast: podcast })
}

const useStore = create((set,get) => ({
	
}))


export default useStore;