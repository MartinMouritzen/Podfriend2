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
		podcast.receivedFromServer = new Date();
		podcast.receivedFromServerText = podcast.receivedFromServer.toString();
		ClientStorage.setItem('podcast_cache_' + path,podcast);
	},
	/**********************************************************************************
	* Continue listening and latest podcasts
	***********************************************************************************/
	continueListeningEpisodeListMaxSize: 50,
	continueListeningEpisodeList: [],
	deletePodcastFromContinueListeningList: (episodeGuid) => {
		var continueListeningEpisodeList = get().continueListeningEpisodeList;
		set(
			produce((state) => {
				const episodeIndex = state.continueListeningEpisodeList.findIndex((el) => { return el.episodeGuid == episodeGuid; });
				state.continueListeningEpisodeList.splice(episodeIndex, 1);
			})
		)
		
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
					console.log(feedPaths);
					console.log(followedPodcasts);
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
	lastOtherUsersListenRefresh: false,
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
	__retrieveOtherUsersListenToPodcasts: async() => {
		const latestListenedAPIUrl = `https://api.podfriend.com/podcasts/latestlistened/`;

		try {
			let rawResults = await fetch(latestListenedAPIUrl);
			let results = await rawResults.json();

			return results;
		}
		catch(exception) {
			console.log('Error getting latestListened podcasts');
			console.log(latestListenedAPIUrl);
			console.log(exception);
		}
	},
	refreshOtherUsersListenToPodcasts: async() => {
		let shouldUpdate = false;
		let lastOtherUsersListenRefresh = get().lastOtherUsersListenRefresh;
	
		if (!lastOtherUsersListenRefresh) {
			shouldUpdate = true;
		}
		else {
			lastOtherUsersListenRefresh = new Date(lastOtherUsersListenRefresh);
	
			const msBetweenDates = Math.abs(lastOtherUsersListenRefresh.getTime() - new Date().getTime());
			const hoursBetweenDates = msBetweenDates / (60 * 60 * 1000);
	
			if (hoursBetweenDates > 1) {
				shouldUpdate = true;
			}
		}
		return ClientStorage.getItem('other_users_listened')
		.then((otherUsersListenedList) => {
			if (shouldUpdate || !otherUsersListenedList) {
				console.log('Should refresh other users listened podcasts.');
				
				return get().__retrieveOtherUsersListenToPodcasts()
				.then((otherUsersListenedList) => {
					console.log(otherUsersListenedList);
					if (otherUsersListenedList && otherUsersListenedList.podcasts) {
						ClientStorage.setItem('other_users_listened',otherUsersListenedList.podcasts)

						set({
							lastOtherUsersListenRefresh: new Date()
						});
						return otherUsersListenedList.podcasts;
					}
					else {
						console.log('No otherUsersListenedList returned in refreshOtherUsersListenToPodcasts');
					}
				});
			}
			else {
				return otherUsersListenedList;
			}
		});
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
				
				return get().__retrieveTrendingPodcasts(false,limit)
				.then((trendingPodcasts) => {
					// console.log(trendingPodcasts);
					ClientStorage.setItem('trending_podcasts_all',trendingPodcasts)

					set({
						lastTrendingPodcastRefresh: new Date()
					});
					return trendingPodcasts;
				});
			}
			else {
				return trendingPodcasts;
			}
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
			let results;
			var cache = await ClientStorage.getItem(byGuidUrl);
			var shouldRefresh = true;
			if (cache && cache.cachedTime) {
				var secondsSinceLastUpdate = Math.floor((Math.abs(new Date() - new Date(cache.cachedTime)) / 1000));

				if (secondsSinceLastUpdate < 600) {
					shouldRefresh = false;
				}
			}
			if (shouldRefresh) {
				console.log('Refreshing podcast by guid');
				let rawResults = await fetch(byGuidUrl);
				results = await rawResults.json();
				results.cachedTime = new Date();

				ClientStorage.setItem(byGuidUrl,results);
			}
			else {
				console.log('Using cache in retrievepodcastbyguid');
				results = cache;
			}
			return results;
		}
		catch(exception) {
			console.log('Error getting trending podcasts');
			console.log(byGuidUrl);
			console.log(exception);
		}
	},
	retrievePodcastByPath: (podcastPath) => {
		var podcastAPIURL = "https://api.podfriend.com/podcast/" + encodeURIComponent(podcastPath);

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
		var sortOrder = podcastState?.sortOrder;

		if (!podcastState || !podcastState.seasonType) {
			let episodeInfo = PodcastUtil.parseEpisodes(podcastData,podcastData.episodes);
			if (episodeInfo) {
				seasonType = episodeInfo.podcastSeasonType;
			}
		}
		if (!podcastState || !podcastState.sortOrder) {
			if (typeof seasonType !== 'undefined') {
				sortOrder = seasonType == 'season' ? 'old' : 'new';
			}
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
				if (seasonType) {
					state.podcasts[podcastPath].seasonType = seasonType;
				}
				if (sortOrder) {
					state.podcasts[podcastPath].sortOrder = sortOrder;
				}
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
	getPrimaryColorsForImage: (imageUrl) => {
		return Vibrant.from(imageUrl).getPalette()
		.then((palette) => {
			var colors = {};
			for(let color in palette) {
				var yiq = palette[color].getYiq();
				colors[color] = {
					type: color,
					yiq: yiq,
					rgb: palette[color].getRgb(),
					hex: palette[color].getHex(),
					titleTextColor:  yiq < 200 ? '#FFFFFF' : '#000000',
					bodyTextColor: yiq < 150 ? '#FFFFFF' : '#000000'
				};
			}
			// console.log(colors);

			/*
			palette.yiq = palette['Vibrant'].getYiq()
			palette.titleText = palette.yiq < 200 ? '#ffffff' : '#000000';
			palette.bodyText = palette.yiq < 150 ? '#ffffff' : '#000000';
			*/

			return colors;
		});
	},
	getPrimaryColorsForPodcast: (podcastPath,podcastData) => {
		return get().getPrimaryColorsForImage('https://podcastcovers.podfriend.com/' + podcastPath + '/400x400/' + podcastData.artworkUrl600)
		.then((colors) => {
			console.log(colors);
			set(
				produce((state) => {
					state.podcasts[podcastPath].colors = colors;
				})
			);
			return colors;
		});
	},
	getPodcastFromCache: (podcastPath) => {
		return ClientStorage.getPodcast(podcastPath)
		.then((podcastData) => {
			if (podcastData) {
				var podcastState = get().podcasts[podcastPath];
				if (!podcastState) {
					get().__updatePodcastState(podcastPath,podcastData,podcastState);
				}
				// if (!podcastState.colors) {
					// console.log('podcastState.colors refresh');
					// get().getPrimaryColorsForPodcast(podcastPath,podcastData);
				// }
				// console.log('podcastState.colors2');
				// console.log(podcastState.colors);
				return podcastData;
			}
			return false;
		});
	},
	retrievePodcastFromServer: (podcastPath) => {
		return get().retrievePodcastByPath(podcastPath)
		.then((data) => {
			console.log(data);
			if (data.error) {
				console.log('Error fetching podcast in PodcastSlice::fetchPodcast');
				console.log(data.error);
				
				return Promise.reject('Error fetching podcast: ' + podcastPath);
			}

			var podcastData = get().__managePodcastResults(data,podcastPath);

			get().addPodcastToCache(podcastPath,podcastData);

			var podcastState = get().podcasts[podcastPath];
			get().__updatePodcastState(podcastPath,podcastData,podcastState);
			if (!podcastState) {
				podcastState = get().podcasts[podcastPath];
			}

			// if (!podcastState.colors) {
				// get().getPrimaryColorsForPodcast(podcastPath,podcastData);
			// }

			return data;
		})
		.catch((exception) => {
			console.log('Fetch error in fetching podcast: ' + podcastPath);
			console.log(exception);

			return false;
		});
	},
	retrieveOriginalPodcastFeed: (podcastPath,feedUrl,overruleCache = false) => {
		var podcastFeed = new PodcastFeed(feedUrl);
		var shouldUpdate = false;

		return ClientStorage.getItem('podcast_rssfeed_cache_' + podcastPath)
		.then((rssFeedCache) => {
			var podcastState = get().podcasts[podcastPath];
			var lastRSSFeedUpdate = podcastState ? podcastState.lastRSSFeedUpdate : false;

			if (overruleCache || !lastRSSFeedUpdate || !rssFeedCache) {
				console.log('Original RSS not cached');
				console.log(lastRSSFeedUpdate);
				console.log(rssFeedCache);
				shouldUpdate = true;
			}
			else {
				var secondsSinceLastUpdate = Math.floor((Math.abs(new Date() - new Date(lastRSSFeedUpdate)) / 1000));
				// console.log('secondsSinceLastUpdate');
				// console.log(secondsSinceLastUpdate);
					
				if (isNaN(secondsSinceLastUpdate) || secondsSinceLastUpdate > 300) {
					console.log('Original RSS secondsSinceLastUpdate: ' + secondsSinceLastUpdate);
					shouldUpdate = true;
				}
			}
			if (!shouldUpdate) {
				console.log('Original RSS Feed cached: ' + secondsSinceLastUpdate);
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
								if (!state.podcasts[podcastPath]) {
									state.podcasts[podcastPath] = {};
								}
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