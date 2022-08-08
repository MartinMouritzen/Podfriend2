import create from 'zustand'
import produce from 'immer';

import defaultTileMap from './defaultTileMap';

import SoundManager from 'renderer/Library/SoundManager';

const increaseOre = (increaseWith) => {
	var ore = useStore.getState().ore
	useStore.setState({ ore: ore + increaseWith })
}

const resourceTick = () => {
	var colonies = useStore.getState().colonies;

	for (var colonyName in colonies){
		var colony = colonies[colonyName];
		var tilemap = colony['tileMap'];
		for(var y=0;y<tilemap.length;y++) {
			for(var x=0;x<tilemap[y].length;x++) {
				if (tilemap[y][x] && tilemap[y][x].buildingType) {
					if (tilemap[y][x].buildingType === 'housing') {
						console.log('housing');
					}
					else if (tilemap[y][x].buildingType === 'mine') {
						console.log('mine');
					}
				}
			}
		}
	}
};

const useStore = create((set,get) => ({
	ore: 1000,
	energy: 1000,
	robots: 200,
	population: 10000,
	increaseOre: increaseOre,
	soundManager: new SoundManager(),
	clickOre: () => {
		set(state => ({ ore: state.ore + 1 }))
	},
	buyBuilding: (colonyId,building,x,y) => {
		// set(state => ({ colonies[colonyId].tileMap[y][x].building: state.ore + 1 }))
		set(
			produce((state) => {
				console.log(colonyId + ':' + x + ':' + y);
				// console.log(state.colonies['mars']['tileMap'][y][x]);

				const newBuilding = structuredClone(building);
				console.log('newBuilding');
				console.log(newBuilding);

				try {
					var level = 1;

					if (state.colonies[colonyId]['tileMap'][y][x].building && state.colonies[colonyId]['tileMap'][y][x].building.level == 1) {
						newBuilding.level = 2;
					}

					state.colonies[colonyId]['tileMap'][y][x] = {
						tileType: state.colonies[colonyId]['tileMap'][y][x].tileType,
						tileNumber: state.colonies[colonyId]['tileMap'][y][x].tileNumber,
						building: newBuilding
					};
				}
				catch (exception) {
					console.log(exception);
				}
	
			})
		)
	},
	colonies: {
		mars: {
			tileMap: defaultTileMap
			/*
			tileMap: [
				[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3],
				[3,2,3,4,5,6,7,8,3,3,3,3,3,3,3,3]
			]
			*/
		}
	},
	currentColony: () => {

	},
	resourceTick: resourceTick
}))


export default useStore;