import produce from 'immer'

import structuredClone from '@ungap/structured-clone';

import ClientStorage from './ClientStorage';

import PodcastUtil from 'library/PodcastUtil';

import PodcastFeed from 'library/PodcastFeed';

import { v4 as uuidv4 } from 'uuid';

import DOMPurify from 'dompurify';

/**
* Gets a podcast from the API
**/

export const createPodcastSlice = (set, get) => ({
	podcasts: {},
	addPodcastToCache: (path,podcast) => {
		if (!path) {
			console.log('No path given in PodcastSlice.addPodcastToCache');
			console.log(path);
			console.log(podcast);
			return;
		}
		ClientStorage.setItem('podcast_cache_' + path,podcast);
	},
	/**********************************************************************************
	* Continue listening and latest podcasts
	***********************************************************************************/
	continueListeningEpisodeListMaxSize: 50,
	continueListeningEpisodeList: [],
	addEpisodeToContinueListeningList: (podcast,episode) => {
		var continueListeningEpisodeList = [...get().continueListeningEpisodeList];

		var podcastToStore = structuredClone(podcast);
		delete podcastToStore.episodes;

		/*
		// We only want to store as little as possible
		var podcastToStore = {
			path: podcast.path,
			image: 
			dateFollowed: new Date()
		};
		*/

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
	deletePodcastFromContinueListeningList: (episodeGuid) => {
		set(
			produce((state) => {
				const index = state.continueListeningEpisodeList.findIndex(continueListeningEpisode => continueListeningEpisode.episodeGuid === episodeGuid);
				state.continueListeningEpisodeList.splice(index,1);
			})
		);
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
	getFollowedPodcastList: () => {
		var podcasts = get().podcasts;
		var list = [];
		// get().followedPodcasts.forEach((followedPodcast) => {
		var followedPodcasts = get().followedPodcasts;
		for (const [podcastPath,followedPodcast] of Object.entries(followedPodcasts)) {
			var podcast = structuredClone(podcasts[podcastPath]);

			if (podcast) {
				podcast.dateFollowed = followedPodcast.dateFollowed;
			
				list.push(podcast);
			}
		}
		return list;
	},
	followedPodcasts: {},
	isPodcastFollowed: (podcastPath) => {
		if (get().followedPodcasts[podcastPath]) {
			return true;
		}
		return false;
	},
	followMultiplePodcast: (podcasts) => {
		set(
			produce((state) => {
				podcasts.forEach((podcastData) => {
					if (!state.followedPodcasts[podcastData.path]) {
						state.followedPodcasts[podcastData.path] = {
							dateFollowed: podcastData.addedDate ? podcastData.addedDate : new Date()
						};
					}
				});
			})
		);

		/*
		var followedPodcasts = structuredClone(get().followedPodcasts);

		podcasts.forEach((podcast) => {
			if (get().isPodcastFollowed(podcast.path) === false) {
				var podcastToStore = structuredClone(podcast);
				delete podcastToStore.episodes;
				podcastToStore.dateFollowed = new Date();

				followedPodcasts.push(podcastToStore);
			}
		});
		set({
			followedPodcasts: followedPodcasts
		});
		*/
	},
	followPodcast: (podcastPath) => {
		if (!podcastPath) { return; }
		set(
			produce((state) => {
				if (!state.followedPodcasts[podcastPath]) {
					state.followedPodcasts[podcastPath] = {
						dateFollowed: new Date()
					};
				}
			})
		)
	},
	unfollowPodcast: (podcastPath) => {
		if (!podcastPath) { return; }

		set(
			produce((state) => {
				delete state.followedPodcasts[podcastPath];
			})
		)
	},
	updateFollowedPodcastListeningDate: (podcast) => {
		var followedPodcasts = get().followedPodcasts;

		var foundIndex = false;
		followedPodcasts.forEach((followedPodcast,index) => {
			if (followedPodcast.guid === podcast.guid) {
				foundIndex = index;
			}
		});

		if (foundIndex) {
			set(
				produce((state) => {
					state.followedPodcasts[foundIndex].lastListened = new Date();
				})
			)
		}
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
				for (const [podcastPath,followedPodcast] of Object.entries(followedPodcasts)) {
					feedPaths.push(podcastPath);
				}

				try {
					console.log('fetching latest episodes');
					fetch('https://api.podfriend.com/podcast/episodes/?feedPaths=' + feedPaths.join(',') + '&max=' + max)
					.then((result) => {
						return result.json()
					})
					.then((episodes) => {
						if (episodes.error) {
							console.log('episode error');
							console.log(episodes);
							return reject(episodes.error);
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
						return reject(exception);
					});

				}
				catch (exception) {
					set({
						refreshingLatestEpisodes: false
					});
					console.log('Error fetching latest episodes2');
					console.log(exception);
					return reject(exception);
				}
			});
		}
	},
	/**********************************************************************************
	* Details about specific podcast, like sorting, season etc.
	***********************************************************************************/
	updatePodcastAttributes: (podcastPath, attributes) => {
		set(
			produce((state) => {
				if (!state.podcasts[podcastPath]) {
					console.log('No path in updatePodcastAttributes: ' + podcastPath);
					state.podcasts[podcastPath] = {};
				}
				for (const [key, value] of Object.entries(attributes)) {
					state.podcasts[podcastPath][key] = value;
				}
			})
		)
	},
	/**********************************************************************************
	* Trending podcasts
	***********************************************************************************/
	lastTrendingPodcastRefresh: false,
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
		return ClientStorage.getItem('trending_podcasts_all')
		.then((trendingPodcasts) => {
			if (shouldUpdate || !trendingPodcasts) {
				console.log('Should refresh trending podcasts.');
				
				get().__retrieveTrendingPodcasts(false,limit)
				.then((trendingPodcasts) => {
					ClientStorage.setItem('trending_podcasts_all',trendingPodcasts)

					set({
						lastTrendingPodcastRefresh: new Date()
					});
				});
			}
			return trendingPodcasts;
		});
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
	* Episodes
	***********************************************************************************/
	getEpisodeByUrl: (podcast,episodeUrl) => {
		for (var i=0;i<podcast.episodes.length;i++) {
			if (podcast.episodes[i].url == episodeUrl) {
				// console.log(podcast.episodes[i]);
				return podcast.episodes[i];
			}
		}
	},
	/**********************************************************************************
	* Podcast retrieval
	***********************************************************************************/
	fetchingPodcast: false,
	fetchAbortController: null,
	loadPodcast: (podcastPath) => {
		return get().podcasts[podcastPath];
	},
	getPodcastAttribute: (podcastPath,key) => {
		var podcast = get().podcasts[podcastPath];

		if (podcast) {
			return podcast[key];
		}
		return false;
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
	__managePodcastResults: (data,podcastPath,isSyncedPodcast = false) => {
			// console.log('Received new version of: ' + data.name);

			if (!isSyncedPodcast) {
				data.receivedFromServer = new Date();
				data.receivedFromServerText = data.receivedFromServer.toString();
			}

			data.safeDescription = DOMPurify.sanitize(data.description, {
				ALLOWED_TAGS: [
					'p','br','ol','ul','li','b','a'
				  ]
			});
			data.descriptionNoHTML = DOMPurify.sanitize(data.description, {
				ALLOWED_TAGS: [
					
				]
			});

			if (data && data.episodes) {
				for (var i=0;i<data.episodes.length;i++) {
					if (!data.episodes[i].descriptionNoHTML && data.episodes[i].description) {
						data.episodes[i].descriptionNoHTML = DOMPurify.sanitize(data.episodes[i].description, {
							ALLOWED_TAGS: [
								
							  ]
						});
					}
					if (!data.episodes[i].safeDescription && data.episodes[i].description) {
						data.episodes[i].safeDescription = DOMPurify.sanitize(data.episodes[i].description, {
							ALLOWED_TAGS: [
								'p','br','ol','ul','li','b','a','strong'
							  ]
						});
					}
				}
			}
			return data;
	},
	retrievePodcastByGuid: async(guids) => {
		const byGuidUrl = `https://api.podfriend.com/podcasts/byguid/${guids}`;

		try {
			let rawResults = await fetch(byGuidUrl);
			let results = await rawResults.json();

			return results;
		}
		catch(exception) {
			console.log('Error getting trending podcasts');
			console.log(byGuidUrl);
			console.log(exception);
		}
	},
	retrievePodcastByPath: (podcastPath) => {
		var podcastAPIURL = "https://api.podfriend.com/podcast/" + podcastPath;

		return fetch(podcastAPIURL, {
			method: "GET"
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			return data;
		});
	},
	__updatePodcastState: (podcastPath,podcastData,podcastState,stateAttributes = false) => {
		var seasonType = podcastState?.seasonType;
		var sortOrder = podcastState?.sortOrder
;
		if (!podcastState || !podcastState.seasonType) {
			let episodeInfo = PodcastUtil.parseEpisodes(podcastData.episodes);

			seasonType = episodeInfo.podcastSeasonType;
		}
		if (!podcastState || !podcastState.sortOrder) {
			sortOrder = seasonType === 'season' ? 'old' : 'new';
		}

		set(
			produce((state) => {
				if (!state.podcasts[podcastPath]) {
					state.podcasts[podcastPath] = {};
				}
				state.podcasts[podcastPath].path = podcastPath;
				state.podcasts[podcastPath].name = podcastData.name;
				state.podcasts[podcastPath].guid = podcastData.guid;
				state.podcasts[podcastPath].author = podcastData.author;
				state.podcasts[podcastPath].description = podcastData.description;
				state.podcasts[podcastPath].image = podcastData.artworkUrl600 ? podcastData.artworkUrl600 : podcastData.image;
				state.podcasts[podcastPath].categories = podcastData.categories;
				state.podcasts[podcastPath].lastUpdated = new Date();
				state.podcasts[podcastPath].seasonType = seasonType;
				state.podcasts[podcastPath].sortOrder = sortOrder;
				if (stateAttributes) {
					for (const [key,value] of Object.entries(stateAttributes)) {
						if (!state.podcasts[podcastPath][key]) {
							state.podcasts[podcastPath][key] = value;
						}
					}
				}

				if (!state.podcasts[podcastPath].episodes) {
					state.podcasts[podcastPath].episodes = {}
				}
			})
		)
	},
	getPodcastFromCache: (podcastPath) => {
		return ClientStorage.getPodcast(podcastPath)
		.then((podcastData) => {
			if (podcastData) {
				var podcastState = get().podcasts[podcastPath];
				if (!podcastState) {
					get().__updatePodcastState(podcastPath,podcastData,podcastState);
				}
				return podcastData;
			}
			return false;
		});
	},
	retrievePodcastFromServer: (podcastPath) => {
		return get().retrievePodcastByPath(podcastPath)
		.then((data) => {
			if (data.error) {
				console.log('Error fetching podcast in Redux::fetchPodcast');
				console.log(data.error);
				
				return Promise.reject('Error fetching podcast: ' + podcastIdentifier);
			}

			var podcastData = get().__managePodcastResults(data,podcastPath);

			get().addPodcastToCache(podcastPath,podcastData);

			var podcastState = get().podcasts[podcastPath];
			get().__updatePodcastState(podcastPath,podcastData,podcastState);

			return data;
		});
	},
	retrieveOriginalPodcastFeed: (podcastPath,feedUrl,overruleCache = false) => {
		var podcastFeed = new PodcastFeed(feedUrl);
		var shouldUpdate = false;

		return ClientStorage.getItem('podcast_rssfeed_cache_' + podcastPath)
		.then((rssFeedCache) => {
			var lastRSSFeedUpdate = get().podcasts[podcastPath].lastRSSFeedUpdate;

			if (overruleCache || !lastRSSFeedUpdate || !rssFeedCache) {
				console.log('Original RSS not cached');
				console.log(lastRSSFeedUpdate);
				console.log(rssFeedCache);
				shouldUpdate = true;
			}
			else {
				var minutesSinceLastUpdate = Math.floor((Math.abs(new Date() - new Date(lastRSSFeedUpdate)) / 1000) / 60);
					
				if (isNaN(minutesSinceLastUpdate) || minutesSinceLastUpdate > 5) {
					console.log('Original RSS minutesSinceLastUpdate: ' + minutesSinceLastUpdate);
					shouldUpdate = true;
				}
			}
			if (!shouldUpdate) {
				console.log('Original RSS Feed cached');
				return Promise.resolve(rssFeedCache);
			}
			else {
				console.log('Fetching original RSS feed to scan for changes.: ' + feedUrl);
				return podcastFeed.parse()
				.then((feed) => {
					if (feed) {
						console.log('Fetching original RSS feed to scan for changes. - Done');

						feed.uuid = uuidv4();

						ClientStorage.setItem('podcast_rssfeed_cache_' + podcastPath,feed);

						set(
							produce((state) => {
								state.podcasts[podcastPath].lastRSSFeedUpdate = new Date();
							})
						)
						return Promise.resolve(feed);
					}
					else {
						console.log('PodcastFeed.parse resulted in no feed');
						return Promise.reject();
					}
				})
				.catch((error) => {
					console.error('Error parsing RSS feed: ');
					console.error(error);
				});
			}
		})
		.catch((exception) => {
			console.log('Error happened retrieving original RSS feed');
			console.log(podcastPath);
			console.log(feedUrl);
			console.log(exception);
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