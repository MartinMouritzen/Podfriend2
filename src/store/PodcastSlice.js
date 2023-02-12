import ClientStorage from './ClientStorage';

const clientStorage = new ClientStorage();

import PodcastUtil from 'library/PodcastUtil';


/**
* Gets a podcast from the API
**/

export const createPodcastSlice = (set, get) => ({
	/**********************************************************************************
	* Favorite settings
	***********************************************************************************/
	favoriteSorderOrder: 'latest',
	setFavoriteSorderOrder: (newOrder) => {
		set({
			favoriteSorderOrder: newOrder
		});
	},
	/**********************************************************************************
	* Following
	***********************************************************************************/
	followedPodcasts: [],
	isPodcastFollowed: (podcastPath) => {
		let isFollowed = false;
		get().followedPodcasts.forEach((podcast,index) => {
			if (podcast.path == podcastPath) {
				isFollowed = true;
			}
		});
		return isFollowed;
	},
	followPodcast: (podcast) => {
		if (!podcast) {
			return;
		}
		if (get().isPodcastFollowed(podcast.path) === false) {
			// Removing the episodes before putting the array in. We don't want to waste a ton of space.
			var podcastToStore = structuredClone(podcast);
			delete podcastToStore.episodes;

			podcastToStore.dateFollowed = new Date();

			var followedPodcasts = get().followedPodcasts;
			followedPodcasts.push(podcastToStore);

			set({
				followedPodcasts: followedPodcasts
			});
		}
	},
	unfollowPodcast: (podcast) => {
		if (!podcast) {
			return;
		}
        const newFollowList = get().followedPodcasts.filter((i) => i.path !== podcast.path);
        set({
			followedPodcasts: newFollowList
		});
	},
	/**********************************************************************************
	* Details about specific podcast, like sorting, season etc.
	***********************************************************************************/
	updatePodcastConfig: ({ guid, podcastPath, season = false, sortOrder = false }) => {
		return clientStorage.getPodcast(podcastPath)
		.then((podcastCache) => {
			if (season) {
				podcastCache.configSelectedSeason = season;
			}
			if (sortOrder) {
				podcastCache.configSelectedSortOrder = sortOrder;
			}
			clientStorage.setItem('podcast_cache_' + podcastPath,podcastCache);

			const activePodcast = get().activePodcast;
	
			if (activePodcast.guid === guid) {
				if (season) {
					activePodcast.configSelectedSeason = season;
				}
				if (sortOrder) {
					activePodcast.configSelectedSortOrder = sortOrder;
				}
			}
		});
	},
	/**********************************************************************************
	* Trending podcasts
	***********************************************************************************/
	lastTrendingPodcastRefresh: false,
	trendingPodcasts: [],
	refreshTrendingPodcasts: async(categoryId,limit = 14) => {
		let shouldUpdate = false;
		let lastTrendingPodcastRefresh = get().lastTrendingPodcastRefresh;
	
		if (!lastTrendingPodcastRefresh) {
			shouldUpdate = true;
		}
		else {
			lastTrendingPodcastRefresh = new Date(lastTrendingPodcastRefresh);
	
			const msBetweenDates = Math.abs(lastTrendingPodcastRefresh.getTime() - new Date().getTime());
			const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);
	
			if (hoursBetweenDates > 1) {
				shouldUpdate = true;
			}
		}
		if (shouldUpdate) {
			console.log('Should refresh trending podcasts.');
			const trendingAPIUrl = `https://api.podfriend.com/podcasts/trending/${categoryId ? categoryId : ''}?limit=${limit}`;
	
			try {
				let rawResults = await fetch(trendingAPIUrl);
				let results = await rawResults.json();
	
				set({
					trendingPodcasts: results,
					lastTrendingPodcastRefresh: new Date()
				});
			}
			catch(exception) {
				console.log('Error getting trending podcasts');
				console.log(trendingAPIUrl);
				console.log(exception);
			}
		}
	},
	/**********************************************************************************
	* Searching
	***********************************************************************************/
	getSearchHints: (query) => {

	},
	searchPodcasts: (query,searchType = 'podcast') => {
		var searchUrl = 'https://api.podfriend.com/search/' + (searchType == 'podcast' ? 'podcast' : 'person') + '/' + encodeURIComponent(query);
		let authToken = false;

		return fetch(searchUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'User-Agent': 'Podfriend',
				'Authorization': `Bearer ${authToken}`
			}
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			return data;
		});
	},
	/**********************************************************************************
	* Episode data
	***********************************************************************************/
	markEpisodeAsListened: (podcast,episode) => {

	},
	/**********************************************************************************
	* Podcast retrieval
	***********************************************************************************/
	fetchingPodcast: false,
	fetchAbortController: null,
	getPodcastFromCache: (podcastPath) => {
		return clientStorage.getPodcast(podcastPath)
		.then((podcastCache) => {
			if (podcastCache) {
				var shouldUpdateCache = false;
				if (!podcastCache.podcastSeasonType) {
					let episodeInfo = PodcastUtil.parseEpisodes(podcastCache.episodes);

					podcastCache.podcastSeasonType = episodeInfo.podcastSeasonType;
					shouldUpdateCache = true;
				}
				if (!podcastCache.configSelectedSortOrder || typeof podcastCache.configSelectedSortOrder === 'undefined') {
					if (podcastCache.podcastSeasonType === 'season') {
						podcastCache.configSelectedSortOrder = 'old';
					}
					else {
						podcastCache.configSelectedSortOrder = 'new';
					}
					shouldUpdateCache = true;
				}
				if (shouldUpdateCache) {
					clientStorage.setItem(podcastPath,podcastCache);
				}
			}

			return podcastCache;
		});
	},
	shouldPodcastUpdate: (podcastCache) => {
		var shouldUpdate = false;
	
		if (!podcastCache || !podcastCache.receivedFromServer) {
			console.log('strange, no podcastCache.receivedFromServer. This should not happen.');
			shouldUpdate = true;
		}
		else {
			var minutesSinceLastUpdate = Math.floor((Math.abs(new Date() - podcastCache.receivedFromServer) / 1000) / 60);

			// minutesSinceLastUpdate = 10;
				
			if (isNaN(minutesSinceLastUpdate) || minutesSinceLastUpdate > 5) {
				console.log('More than 5 minutes since last update. Fetching new version of: ' + podcastCache.name);
				shouldUpdate = true;
			}
		}
		return shouldUpdate;
	},
	retrievePodcastFromServer: (podcastPath,podcastCache) => {
		var podcastAPIURL = "https://api.podfriend.com/podcast/" + podcastPath;

		let abortController = new AbortController();
		let authToken = false;

		// If we are in the process of fetching already we need to abort.
		if (get().fetchingPodcast) {
			if (get().fetchAbortController) {

			}
		}

		return fetch(podcastAPIURL, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${authToken}`
			},
			signal: abortController.signal
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			if (data.error) {
				console.log('Error fetching podcast in Redux::fetchPodcast');
				console.log(data.error);
				
				throw new Error('Error fetching podcast: ' + podcastPath);
			}
			else {
				console.log('Received new version of: ' + data.name);
				data.receivedFromServer = new Date();

				// Copy over configuration options from the cache
				console.log('Copy over configuration options from the cache');
				console.log(podcastCache);

				if (podcastCache) {
					data.configSelectedSeason = podcastCache.configSelectedSeason;
					data.configSelectedSortOrder = podcastCache.configSelectedSortOrder;
				}
				if (!data.podcastSeasonType) {
					let episodeInfo = PodcastUtil.parseEpisodes(data.episodes);
					data.podcastSeasonType = episodeInfo.podcastSeasonType;
				}
				if (!data.configSelectedSortOrder || typeof data.configSelectedSortOrder === 'undefined') {
					if (data.podcastSeasonType === 'season') {
						data.configSelectedSortOrder = 'old';
					}
					else {
						data.configSelectedSortOrder = 'episodic';
					}
				}

				clientStorage.setItem('podcast_cache_' + data.path,data);

				return data;
			}
		});
	},
	getPodcast: (podcastPath) => {
		var startTime = performance.now();
	
		return get().getPodcastFromCache(podcastPath)
		.then((podcastCache) => {
			var shouldUpdate = get().shouldPodcastUpdate(podcastCache);
	
			if (!shouldUpdate) {
				console.log('Using cache for podcast: ' + podcastPath);
				return podcastCache;
			}
			else {
				return get().retrievePodcastFromServer(podcastPath,podcastCache)
				.catch((error) => {
					console.log('Error2 fetching podcast in PodcastPage::fetchPodcast: ' + error);
					console.log('We should not dispatch a redux error if this is an abort.');
					console.log(error);
					
					throw error;
				});
			}
		});
	},
});