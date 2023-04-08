import ClientStorage from './ClientStorage';

const clientStorage = new ClientStorage();

import PodcastUtil from 'library/PodcastUtil';

import PodcastFeed from 'library/PodcastFeed';

import { v4 as uuidv4 } from 'uuid';

import DOMPurify from 'dompurify';

/**
* Gets a podcast from the API
**/

export const createPodcastSlice = (set, get) => ({
	/**********************************************************************************
	* Continue listening and latest podcasts
	***********************************************************************************/
	continueListeningEpisodeListMaxSize: 50,
	continueListeningEpisodeList: [],
	addEpisodeToContinueListeningList: (podcast,episode) => {
		var continueListeningEpisodeList = [...get().continueListeningEpisodeList];

		var podcastToStore = structuredClone(podcast);
		delete podcastToStore.episodes;

		continueListeningEpisodeList.unshift({
			podcastName: podcast.name,
			podcastPath: podcast.path,
			dateListened: new Date(),
			podcast: podcastToStore,
			episode: episode
		});

		/*
		// Debug code that lets us remove if an empty episode has been added
		for(var i=continueListeningEpisodeList.length - 1;i>=1;i--) {
			if (!continueListeningEpisodeList[i]) {
				continueListeningEpisodeList.splice(i,1);
			}
		}
		set({
			continueListeningEpisodeList: continueListeningEpisodeList
		});
		return;
		*/

		var alreadyExisted = false;
		for(var i=continueListeningEpisodeList.length - 1;i>=1;i--) {
			if (continueListeningEpisodeList[i]['episode'].guid == episode.guid) {
				continueListeningEpisodeList.splice(i,1);
				alreadyExisted = true;
			}
		}

		if (!alreadyExisted && continueListeningEpisodeList.length > get().continueListeningEpisodeListMaxSize) {
			continueListeningEpisodeList.pop();
		}
		set({
			continueListeningEpisodeList: continueListeningEpisodeList
		});
	},
	deletePodcastFromContinueListeningList: (episode) => {
		var continueListeningEpisodeList = [...get().continueListeningEpisodeList];
		for(var i=continueListeningEpisodeList.length - 1;i>=0;i--) {
			if (continueListeningEpisodeList[i]['episode'].guid == episode.guid) {
				continueListeningEpisodeList.splice(i,1);
			}
		}
		set({
			continueListeningEpisodeList: continueListeningEpisodeList
		});
	},
	/**********************************************************************************
	* Favorite settings
	***********************************************************************************/
	favoriteSortOrder: 'latestListened',
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
		if (!podcast || !podcast.path) {
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
	updateFollowedPodcastListeningDate: (podcast) => {
		var followedPodcasts = [...get().followedPodcasts];

		var foundIndex = false;
		followedPodcasts.forEach((followedPodcast,index) => {
			if (followedPodcast.guid === podcast.guid) {
				foundIndex = index;
			}
		});
		if (foundIndex !== false) {
			console.log('updating last listened date of followed podcast');
			console.log(followedPodcasts[foundIndex]);
			followedPodcasts[foundIndex].lastListened = new Date();
		}

        set({
			followedPodcasts: followedPodcasts
		});
	},
	/**********************************************************************************
	* Latest episodes
	***********************************************************************************/
	lastLatestEpisodesRefresh: false,
	refreshingLatestEpisodes: false,
	latestEpisodes: [],
	retrieveLatestEpisodes: (max = 24) => {
		let shouldUpdate = false;
		let lastLatestEpisodesRefresh = get().lastLatestEpisodesRefresh;

		set({
			refreshingLatestEpisodes: true
		});
	
		if (!lastLatestEpisodesRefresh) {
			shouldUpdate = true;
		}
		else {
			lastLatestEpisodesRefresh = new Date(lastLatestEpisodesRefresh);
	
			const msBetweenDates = Math.abs(lastLatestEpisodesRefresh.getTime() - new Date().getTime());
			const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);
	
			if (hoursBetweenDates > 1) {
				shouldUpdate = true;
			}
		}

		if (!shouldUpdate) {
			set({
				refreshingLatestEpisodes: false
			});
			return Promise.resolve(get().latestEpisodes);
		}
		else if (shouldUpdate) {
			var followedPodcasts = get().followedPodcasts;
			return new Promise((resolve,reject) => {
				// console.log(subscribedPodcasts);
				var feedPaths = [];
				for(var i=0;i<followedPodcasts.length;i++) {
					feedPaths.push(followedPodcasts[i].path);
				}

				try {
					console.log('fetching latest episodes');
					fetch('https://api.podfriend.com/podcast/episodes/?feedPaths=' + feedPaths.join(',') + '&max=' + max)
					.then((result) => {
						return result.json()
					})
					.then((episodes) => {
						if (episodes.error) {
							return reject();
						}
						else {
							set({
								latestEpisodes: episodes,
								refreshingLatestEpisodes: false,
								lastLatestEpisodesRefresh: new Date()
							});
							return resolve(episodes);
						}
					})
					.catch((exception) => {
						console.log('Error fetching latest episodes1');
						console.log(exception);
						set({
							refreshingLatestEpisodes: false
						});
						return reject();
					});

				}
				catch (exception) {
					set({
						refreshingLatestEpisodes: false
					});
					console.log('Error fetching latest episodes2');
					console.log(exception);
					return reject();
				}
			});
		}
	},
	/**********************************************************************************
	* Details about specific podcast, like sorting, season etc.
	***********************************************************************************/
	updatePodcastAttributes: ({ podcastData, attributes }) => {
		var activePodcast = get().activePodcast;
		/*
		console.log('Updating attributes');
		console.log(activePodcast);
		console.log(podcastData);
		console.log(attributes);
		*/

		if (activePodcast.guid === podcastData.guid) {
			var activePodcastCopy = structuredClone(activePodcast);
			for (const [key, value] of Object.entries(attributes)) {
				activePodcastCopy[key] = value;
			}
			set({
				activePodcast: activePodcastCopy
			});
			clientStorage.setItem('podcast_cache_' + activePodcastCopy.path,activePodcastCopy);
		}
		else {
			return clientStorage.getPodcast(podcastData.path)
			.then((podcastCache) => {
				for (const [key, value] of Object.entries(attributes)) {
					podcastCache[key] = value;
				}
				clientStorage.setItem('podcast_cache_' + podcastData.path,podcastCache);
			});
		}
	},
	updatePodcastConfig: ({ guid, podcastPath, season = false, sortOrder = false }) => {
		const activePodcast = get().activePodcast;

		return (activePodcast.path == podcastPath ? Promise.resolve(activePodcast) : clientStorage.getPodcast(podcastPath))
		.then((podcastCache) => {
			if (season) {
				podcastCache.configSelectedSeason = season;
			}
			if (sortOrder) {
				podcastCache.configSelectedSortOrder = sortOrder;
			}
			clientStorage.setItem('podcast_cache_' + podcastPath,podcastCache);
	
			if (activePodcast.guid === guid) {
				var activePodcastCopy = structuredClone(podcastCache);

				if (season) {
					activePodcastCopy.configSelectedSeason = season;
				}
				if (sortOrder) {
					activePodcastCopy.configSelectedSortOrder = sortOrder;
				}
				set({
					activePodcast: activePodcastCopy
				});
			}
		});
	},
	updateProgress: () => {
		var activeEpisode = get().activeEpisode;
		if (activeEpisode.live) {
			return;
		}

		var currentDuration = get().audioController.getDuration();
		var newProgress = get().audioController.getCurrentTime();
		var newDuration = isNaN(currentDuration) ? activeEpisode.duration : currentDuration;
		let listenedPercentage = (100 * newProgress) / newDuration;

		/*
		// We only want to update if the difference is over a second, or if we're at the very end of the episode (to make sure we capture when the episode ends)
		var difference = Math.abs(activeEpisode.currentTime - newProgress);
		if (difference < 1 || listenedPercentage >= 97) {
			return;
		}
		*/

		var activePodcast = get().activePodcast;

		if (activePodcast ) {
			var activePodcastCopy = structuredClone(activePodcast);
			var activeEpisodeCopy = structuredClone(activeEpisode);

			activeEpisodeCopy.currentTime = newProgress;
			activeEpisodeCopy.duration = newDuration;
			activeEpisodeCopy.listenedPercentage = listenedPercentage;

			var secondsLeft = newDuration - newProgress;

			if (secondsLeft < 20 || listenedPercentage > 97) {
				activeEpisodeCopy.listened = true;
			}
			else {
				// activeEpisodeCopy.listened = false;
			}
			var continueListeningEpisodeListCopy = structuredClone(get().continueListeningEpisodeList);
			// console.log(continueListeningEpisodeListCopy);

			if (listenedPercentage > 2) {
				// Update the continue listening list, so it can display new time left.
				var found = false;
				for(var i=continueListeningEpisodeListCopy.length - 1;i>=0;i--) {
					if (!continueListeningEpisodeListCopy[i]) {
						continue;
					}
					if (continueListeningEpisodeListCopy[i]['episode'].guid == activeEpisodeCopy.guid) {
						found = i;
						if (activeEpisodeCopy.listened) {

						}
						else {
							continueListeningEpisodeListCopy[i]['episode'].currentTime = newProgress;
							continueListeningEpisodeListCopy[i]['episode'].duration = newDuration;
							continueListeningEpisodeListCopy[i]['episode'].listenedPercentage = listenedPercentage;
						}
					}
				}
				if (secondsLeft < 20 || listenedPercentage > 97) {
					if (found !== false) {
						console.log(secondsLeft);
						console.log(listenedPercentage);
						console.log('removing episode at index: ' + found);
						continueListeningEpisodeListCopy.splice(found,1);
					}
				}
				else if (found === false) {
					console.log('adding episode');
					get().addEpisodeToContinueListeningList(activePodcastCopy,activeEpisodeCopy);
					continueListeningEpisodeListCopy = structuredClone(get().continueListeningEpisodeList);
				}
			}


			if (activePodcastCopy.episodes) {
				activePodcastCopy.episodes.forEach((episode,index) => {
					if (episode.url === activeEpisodeCopy.url) {
						// console.log(episode);
						// console.log(activeEpisodeCopy);
						//if (activeEpisodeCopy.listened) {
						//	console.log('setting listened episodes in activepodcast');
						//}

						activePodcastCopy.episodes[index] = activeEpisodeCopy;
					}
				});
			}

			// console.log('updating progress');
			// console.log(activePodcastCopy);
			// console.log(activeEpisodeCopy);

			// newActivePodcast.episodes[]

			// console.log(activeEpisodeCopy.currentTime);
			// console.log(activePodcastCopy);

			// console.log('saved new episode duration');
			// console.log(activePodcastCopy);

			clientStorage.setItem('podcast_cache_' + activePodcastCopy.path,activePodcastCopy);

			set({
				activePodcast: activePodcastCopy,
				activeEpisode: activeEpisodeCopy,
				continueListeningEpisodeList: continueListeningEpisodeListCopy
			});
		}
	},
	/**********************************************************************************
	* Trending podcasts
	***********************************************************************************/
	lastTrendingPodcastRefresh: false,
	trendingPodcasts: [],
	__retrieveTrendingPodcasts: async(categoryId,limit = 14) => {
		const trendingAPIUrl = `https://api.podfriend.com/podcasts/trending/${categoryId ? categoryId : ''}?limit=${limit}`;

		try {
			let rawResults = await fetch(trendingAPIUrl);
			let results = await rawResults.json();

			return results;
		}
		catch(exception) {
			console.log('Error getting trending podcasts');
			console.log(trendingAPIUrl);
			console.log(exception);
		}
	},
	refreshTrendingPodcasts: async(limit = 14) => {
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
			
			get().__retrieveTrendingPodcasts(false,limit)
			.then((results) => {
				set({
					trendingPodcasts: results,
					lastTrendingPodcastRefresh: new Date()
				});
			});
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
				// console.log(podcast.episodes[i]);
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
				
				return Promise.reject('Error fetching podcast: ' + podcastPath);
			}
			else {
				console.log('Received new version of: ' + data.name);
				data.receivedFromServer = new Date();
				data.receivedFromServerText = data.receivedFromServer.toString();

				data.safeDescription = DOMPurify.sanitize(data.description, {
					ALLOWED_TAGS: [
						'p','br','ol','ul','li','b','a'
					  ]
				});
				data.descriptionNoHTML = DOMPurify.sanitize(data.description, {
					ALLOWED_TAGS: [
						
					]
				});
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
				

				if (data && data.episodes) {
					for (var i=0;i<data.episodes.length;i++) {
						if (!data.episodes[i].descriptionNoHTML) {
							data.episodes[i].descriptionNoHTML = DOMPurify.sanitize(data.episodes[i].description, {
								ALLOWED_TAGS: [
									
								  ]
							});
						}
						if (!data.episodes[i].safeDescription) {
							data.episodes[i].safeDescription = DOMPurify.sanitize(data.episodes[i].description, {
								ALLOWED_TAGS: [
									'p','br','ol','ul','li','b','a','strong'
								  ]
							});
						}
						// // Recreate listened states THIS SHOULD BE TEMPORARY UNTIL WE CAN GET IT FROM THE SERVER
						if (podcastCache && podcastCache.episodes) {
							for (var x=0;x<podcastCache.episodes.length;x++) {
								if (data.episodes[i].url == podcastCache.episodes[x].url) {
									if (!data.episodes[i].currentTime) {
										data.episodes[i].currentTime = podcastCache.episodes[x].currentTime;
									}
									if (!data.episodes[i].listened) {
										data.episodes[i].listened = podcastCache.episodes[x].listened;
									}
									break;
								}
							}
						}
					}
				}

				if (get().activePodcast.path === podcastPath) {
					set({
						activePodcast: data
					});
				}
				// console.log('Saving podcast: ' + data.path);
				// console.log(data);
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
				if (feed) {
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
				}
				else {
					console.log('PodcsatFeed.parse resulted in no feed');
					return Promise.reject();
				}
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