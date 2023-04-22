import structuredClone from '@ungap/structured-clone';

import ClientStorage from './ClientStorage';

const clientStorage = new ClientStorage();

export const createServerSyncSlice = (set,get) => ({
	syncingPodcastState: false,
	lastSyncedPodcastState: false,
	episodeStates: {},
	synchronizePodcasts: () => {
		set({
			syncingPodcastState: true
		});

		var lastSyncedPodcastState = get().lastSyncedPodcastState;
		lastSyncedPodcastState = false;

		const podcastSynchronizationURL = 'https://api.podfriend.com/user/favorites/' + (lastSyncedPodcastState ? '?after=' + lastSyncedPodcastState : '');
		return fetch(podcastSynchronizationURL, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			}
		})
		.then((resp) => {
			return resp.json()
		})
		.then((response) => {
			let activePodcast = get().activePodcast;

			if (Array.isArray(response.podcasts)) {
				var followedPodcasts = get().followedPodcasts;

				response.podcasts.forEach((podcast) => {
					get().followPodcast(podcast);
				});
			}
			if (response.episodes && response.episodes.length) {
				// console.log(response.episodes);
				var followedPodcasts = get().followedPodcasts;

				var podcastByGuid = {};
				followedPodcasts.forEach((followedPodcast) => {
					podcastByGuid[followedPodcast.guid] = followedPodcast;
				});


				var episodeStates = structuredClone(get().episodeStates);
				var newEpisodeStates = {};

				// Creating an associative array with all the synced episode states
				response.episodes.forEach((syncingEpisode) => {
					if (!newEpisodeStates[syncingEpisode.podcastGuid]) {
						newEpisodeStates[syncingEpisode.podcastGuid] = {};
					}
					if (!episodeStates[syncingEpisode.podcastGuid]) {
						episodeStates[syncingEpisode.podcastGuid] = {};
					}

					if (!newEpisodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid]) {
						newEpisodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid] = {};
					}
					if (!episodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid]) {
						episodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid] = {};
					}

					newEpisodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid] = syncingEpisode;

					var shouldUpdateEpisodeStates = false;
					if (!episodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid].lastUpdated) {
						shouldUpdateEpisodeStates = true;
					}
					else if (new Date(episodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid].lastUpdated) < new Date(syncingEpisode)) {
						shouldUpdateEpisodeStates = true;
					}

					if (shouldUpdateEpisodeStates) {
						episodeStates[syncingEpisode.podcastGuid][syncingEpisode.episodeGuid] = syncingEpisode;
					}
				});

				// Now let's walk through the podcasts synced
				for (const [podcastGuid, podcastState] of Object.entries(newEpisodeStates)) {
					if (podcastByGuid[podcastGuid]) {
						// console.log('Found podcast: ' + podcastGuid + ':' + podcastByGuid[syncingEpisode.podcastGuid].name);

						/*
						if (podcastByGuid[podcastGuid].path == 'the-last-ride') {
							console.log('syncing the last ride: ' + podcastByGuid[podcastGuid].path);
						}
						*/

						var isActivePodcast = activePodcast.path == podcastByGuid[podcastGuid].path;

						if (isActivePodcast) {
							console.log('This is the active podcast');
						}

						(isActivePodcast ? Promise.resolve(activePodcast) : clientStorage.getPodcast(podcastByGuid[podcastGuid].path))
						.then((cachedPodcast) => {
							/*
							if (podcastByGuid[podcastGuid].path == 'the-last-ride') {
								console.log('Found the last ride in cache');
								console.log(cachedPodcast);
							}
							*/
							if (cachedPodcast && cachedPodcast.episodes) {
								var changesToPodcast = false;

								/*
								if (podcastByGuid[podcastGuid].path == 'the-last-ride') {
									console.log('Looping through episodes');
								}
								*/
								for (const [episodeGuid, episodeState] of Object.entries(newEpisodeStates[podcastGuid])) {
									/*
									if (podcastByGuid[podcastGuid].path == 'the-last-ride') {
										console.log('Looking at episode in the last ride: ' + episodeGuid);
										console.log(episodeState);
									}
									*/
									for(var i=0;i<cachedPodcast.episodes.length;i++) {
										if (cachedPodcast.episodes[i].guid == episodeGuid) {
											changesToPodcast = true;
											if (podcastByGuid[podcastGuid].path == 'podnews-podcasting-news') {
												// console.log('podnews-podcasting-news episode');
												// console.log(episodeState);
											}
											cachedPodcast.episodes[i].currentTime = parseInt(episodeState.currentTime);
											cachedPodcast.episodes[i].listened = episodeState.listened == "true" || episodeState.listened === true;
										}
									}
								}
								if (changesToPodcast) {
									/*
									if (podcastByGuid[podcastGuid].path == 'the-last-ride') {
										console.log('saving cachedPodcast');
										console.log(cachedPodcast);
									}
									*/
									clientStorage.setItem('podcast_cache_' + cachedPodcast.path,cachedPodcast);
								}
							}
							else {
								// console.log('Podcast not found in cache: ' + podcastByGuid[syncingEpisode.podcastGuid].path);
							}
						});
					}
				}

				set({
					episodeStates: episodeStates
				});

				/*
				set({
					followedPodcasts: followedPodcasts
				});
				*/
			}
			set({
				syncingPodcastState: false,
				lastSyncedPodcastState: Math.floor(Date.now() / 1000)
			});
		})
		.catch((error) => {
			console.log('error synchronizing user data.');
			console.log(error);

			set({
				syncingPodcastState: false
			});
		});
	},
	synchronizingEpisodeState: false,
	synchronizeEpisodeState: () => {
		if (get().synchronizingEpisodeState) {
			console.log('Already syncing episode state');
			return;
		}
		set({
			synchronizingEpisodeState: true
		});
		var activePodcast = get().activePodcast;
		var activeEpisode = get().activeEpisode;

		// console.log('activeEpisode.listened');
		// console.log(activeEpisode.listened);
		// console.log(activeEpisode);

		// var listened = activeEpisode.listened ? true : percentageListened > 90 ? true : false;
		
		// console.log(listened);

		const episodeData = {
			podcastGuid: activePodcast.guid,
			episodeGuid: activeEpisode.guid,
			currentTime: activeEpisode.currentTime,
			listened: activeEpisode.listened === true,
			percentageListened: activeEpisode.percentageListened
		};
		// console.log(activePodcast);
		// console.log(activeEpisode);
		// console.log(episodeData);

		const episodeSynchronizationURL = 'https://api.podfriend.com/user/sync/episode/';

		return fetch(episodeSynchronizationURL, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			},
			body: JSON.stringify(episodeData)
		})
		.then((resp) => {
			// console.log(resp);
			return resp.json()
		})
		.then((response) => {
			// console.log('episode sync done');
			// console.log(response);

			set({
				lastUpdatedProgressToServer: new Date().getTime(),
				synchronizingEpisodeState: false
			});
		})
		.catch((error) => {
			console.log('error synchronizing episode data.');
			console.log(error);
			console.log(episodeSynchronizationURL);
			console.log(episodeData);

			set({
				lastUpdatedProgressToServer: new Date().getTime(),
				synchronizingEpisodeState: false
			});
		});
	}
});