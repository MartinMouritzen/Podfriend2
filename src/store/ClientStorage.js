import localForage from "localforage";

class ClientStorage {
	static getPodcast(podcastPath) {
		return this.getItem('podcast_cache_' + podcastPath);
	}
	/**
	*
	*/
	static setItem(key,value) {
		return localForage.setItem(key,value)
		.then((value) => {
			// console.log('ClientStorage.setItem success: ' + value);
		})
		.catch((error) => {
			console.log('Clienstorage.setItem error!');
			console.log(error);
		});
	}
	/**
	*
	*/
	static getItem(key) {
		return localForage.getItem(key);
	}
	/**
	*
	*/
	static removeItem(key) {
		return localForage.removeItem(key);
	}
	/**
	*
	*/
	static clear() {
		return localForage.clear();
	}
}

export default ClientStorage;