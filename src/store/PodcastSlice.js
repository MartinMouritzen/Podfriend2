import ClientStorage from './ClientStorage';

const clientStorage = new ClientStorage();

import PodcastUtil from 'library/PodcastUtil';

import PodcastFeed from 'library/PodcastFeed';

import { v4 as uuidv4 } from 'uuid';

/**
* Gets a podcast from the API
**/

export const createPodcastSlice = (set, get) => ({
	/**********************************************************************************
	* Favorite settings
	***********************************************************************************/
	favoriteSortOrder: 'latest',
	setFavoriteSortOrder: (newOrder) => {
		set({
			favoriteSortOrder: newOrder
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
	updatePodcastAttributes: ({ podcastData, attributes }) => {
		var activePodcast = get().activePodcast;
		console.log('Updating attributes');
		console.log(activePodcast);
		console.log(podcastData);
		console.log(attributes);

		if (activePodcast.guid === podcastData.guid) {
			var activePodcastCopy = structuredClone(activePodcast);
			for (const [key, value] of Object.entries(attributes)) {
				activePodcastCopy[key] = value;
			}
			set({
				activePodcast: activePodcastCopy
			});
		}

		return clientStorage.getPodcast(podcastData.path)
		.then((podcastCache) => {
			for (const [key, value] of Object.entries(attributes)) {
				podcastCache[key] = value;
			}
			clientStorage.setItem('podcast_cache_' + podcastData.path,podcastCache);
		});
	},
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
	updateProgress: () => {
		var activePodcast = get().activePodcast;
		var activeEpisode = get().activeEpisode;

		if (activePodcast ) {
			var newProgress = get().audioController.getCurrentTime();
			var newDuration = get().audioController.getDuration();

			// Update activeEpisode as well as the cached object
			// var newActivePodcast = structuredClone(get().activePodcast);

			let listenedPercentage = (100 * newProgress) / newDuration;

			var activePodcastCopy = structuredClone(activePodcast);
			var activeEpisodeCopy = structuredClone(activeEpisode);
			activeEpisodeCopy.currentTime = newProgress;
			activeEpisodeCopy.duration = newDuration;
			activeEpisodeCopy.listenedPercentage = listenedPercentage;


			activePodcastCopy.episodes.forEach((episode,index) => {
				if (episode.url === activeEpisodeCopy.url) {
					// console.log(episode);
					// console.log(activeEpisodeCopy);

					activePodcastCopy.episodes[index] = activeEpisodeCopy;
				}
			});

			// console.log('updating progress');
			// console.log(activePodcastCopy);
			// console.log(activeEpisodeCopy);

			// newActivePodcast.episodes[]

			// console.log(activeEpisodeCopy.currentTime);
			// console.log(activePodcastCopy);

			clientStorage.setItem('podcast_cache_' + activePodcastCopy.path,activePodcastCopy);

			set({
				activePodcast: activePodcastCopy,
				activeEpisode: activeEpisodeCopy
			});
		}
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

		return fetch(searchUrl, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'User-Agent': 'Podfriend',
				'Authorization': `Bearer ${get().authToken}`
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
	getEpisodeByUrl: (podcast,episodeUrl) => {
		for (var i=0;i<podcast.episodes.length;i++) {
			if (podcast.episodes[i].url == episodeUrl) {
				console.log(podcast.episodes[i]);
				return podcast.episodes[i];
			}
		}
	},
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
				return podcastCache;
			}
			return false;
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
				'Authorization': `Bearer ${get().authToken}`
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
					data.lastOriginalRSSFeedUpdate = podcastCache.lastOriginalRSSFeedUpdate;
					data.rssFeedContents = podcastCache.rssFeedContents;
				}
				if (!data.podcastSeasonType) {
					let episodeInfo = PodcastUtil.parseEpisodes(data.episodes);
					// console.log(episodeInfo);

					data.podcastSeasonType = episodeInfo.podcastSeasonType;
				}
				if (!data.configSelectedSortOrder || typeof data.configSelectedSortOrder === 'undefined') {
					if (data.podcastSeasonType === 'season') {
						data.configSelectedSortOrder = 'old';
					}
					else {
						data.configSelectedSortOrder = 'new';
					}
				}

				clientStorage.setItem('podcast_cache_' + data.path,data);

				return data;
			}
		});
	},
	retrieveOriginalPodcastFeed: (podcastData,overruleCache = false) => {
		var podcastFeed = new PodcastFeed(podcastData.feedUrl);
		var shouldUpdate = false;

		if (!podcastData.lastOriginalRSSFeedUpdate || !podcastData.rssFeedContents) {
			console.log('Original RSS not cached');
			console.log(podcastData.lastOriginalRSSFeedUpdate);
			console.log(podcastData.rssFeedContents);
			shouldUpdate = true;
		}
		else {
			var minutesSinceLastUpdate = Math.floor((Math.abs(new Date() - new Date(podcastData.lastOriginalRSSFeedUpdate)) / 1000) / 60);
				
			if (isNaN(minutesSinceLastUpdate) || minutesSinceLastUpdate > 5) {
				console.log('Original RSS minutesSinceLastUpdate: ' + minutesSinceLastUpdate);
				shouldUpdate = true;
			}
		}
		if (!shouldUpdate) {
			console.log('Original RSS Feed cached');
			return Promise.resolve(podcastData.rssFeedContents);
		}
		else {
			console.log('Fetching original RSS feed to scan for changes.: ' + podcastData.feedUrl);
			return podcastFeed.parse()
			.then((feed) => {
				console.log('Fetching original RSS feed to scan for changes. - Done');

				feed.uuid = uuidv4();

				get().updatePodcastAttributes({
					podcastData: podcastData,
					attributes: {
						rssFeedContents: feed,
						lastOriginalRSSFeedUpdate: new Date()
					}
				});
				return Promise.resolve(feed);

			})
			.catch((error) => {
				console.error('Error parsing RSS feed: ');
				console.error(error);
			});
		}
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