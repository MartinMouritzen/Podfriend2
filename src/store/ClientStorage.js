import localForage from "localforage";

class ClientStorage {
	/**
	*
	*/
	constructor() {
		console.log('Default ClientStorage');
	}
	getPodcast(podcastPath) {
		return this.getItem('podcast_cache_' + podcastPath);
	}
	/**
	*
	*/
	setItem(key,value) {
		return localForage.setItem(key,value)
		/*
		.then((value) => {
			console.log('ClientStorage.setItem success: ' + value);
		})
		*/
		.catch((error) => {
			console.log('Clienstorage.setItem error!');
			console.log(error);
		});
	}
	/**
	*
	*/
	getItem(key) {
		return localForage.getItem(key);
	}
	/**
	*
	*/
	removeItem(key) {
		return localForage.removeItem(key);
	}
	/**
	*
	*/
	clear() {
		return localForage.clear();
	}
}

export default ClientStorage;