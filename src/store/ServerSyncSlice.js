import produce from 'immer'
import structuredClone from '@ungap/structured-clone';
import ClientStorage from './ClientStorage';

export const createServerSyncSlice = (set,get) => ({
	syncingPodcastState: false,
	lastSyncedPodcastState: false,
	synchronizePodcasts: async () => {
		set({
			syncingPodcastState: true
		});

		var lastSyncedPodcastState = get().lastSyncedPodcastState;
		// lastSyncedPodcastState = false;

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
			/*
			resp.text()
			.then((text) => {
				console.log(text);
			});
			*/
			return resp.json()
		})
		.then((response) => {
			let activePodcast = get().activePodcast;

			if (Array.isArray(response.podcasts)) {
				response.podcasts.forEach((podcastDataRaw) => {
					var podcastPath = podcastDataRaw.path;
					var podcastData = get().__managePodcastResults(podcastDataRaw,podcastPath,true);

					stateAttributes = {};

					// state.podcasts[podcastPath].lastListened
					var lastEpisodeUpdateTime = new Date(podcastDataRaw.addedDate);

					if (response.episodes && response.episodes.length) {
						// console.log(response.episodes);
						response.episodes.forEach((episode) => {
							if (episode.path === podcastPath) {
								var episodeTime = parseInt(episode.lastUpdated);
								if (episodeTime > 0) {
									var episodeDate = new Date(episodeTime);
									if (episodeDate > lastEpisodeUpdateTime) {
										lastEpisodeUpdateTime = episodeDate;
									}
								}
							}
						});
						stateAttributes.lastListened = lastEpisodeUpdateTime;
					}

					var podcastState = get().podcasts[podcastPath];
					get().__updatePodcastState(podcastPath,podcastData,podcastState,stateAttributes);

					// Let's make sure not to overwrite the cache if it's already there, because the synced one doesn't contain episode information
					ClientStorage.getPodcast(podcastPath)
					.then((podcastCache) => {
						if (!podcastCache) {
							podcastData.fromSync = true;
							get().addPodcastToCache(podcastPath,podcastData);
						}
					});
				});

				get().followMultiplePodcast(response.podcasts);
			}

			if (response.episodes && response.episodes.length) {
				var newestEpisode = false;

				set(
					produce((state) => {
						response.episodes.forEach((episode) => {
							episode.lastUpdated = parseInt(episode.lastUpdated);
							if (!newestEpisode || newestEpisode.lastUpdated < episode.lastUpdated) {
								newestEpisode = episode;
							}

							if (!state.podcasts[episode.path]) {
								state.podcasts[episode.path] = {};
								state.podcasts[episode.path].path = episode.path;
								state.podcasts[episode.path].guid = episode.podcastGuid;
								state.podcasts[episode.path].episodes = {};
							}
							
							
							try {
								if (!state.podcasts[episode.path].episodes[episode.episodeGuid]) {
									state.podcasts[episode.path].episodes[episode.episodeGuid] = {};
								}
								var shouldUpdate = false;
								if (!state.podcasts[episode.path].episodes[episode.episodeGuid].lastUpdated) {
									shouldUpdate = true;
								}
								else if (parseInt(state.podcasts[episode.path].episodes[episode.episodeGuid].lastUpdated) < episode.lastUpdated) {
									shouldUpdate = true;
								}
								if (shouldUpdate) {
									state.podcasts[episode.path].episodes[episode.episodeGuid].currentTime = episode.currentTime;
									state.podcasts[episode.path].episodes[episode.episodeGuid].listened = episode.listened === true || episode.listened == "true";
									state.podcasts[episode.path].episodes[episode.episodeGuid].lastUpdated = episode.lastUpdated;
								}
							}
							catch(error) {
								console.log('Error synchronizing episodes');
								console.log(error);
								console.log(episode.path);
							}
						});
					})
				)

				// Update active episode
				var activeEpisode = get().activeEpisode;
				
				// If the episode is active, let's check if they listened longer on another device.
				if (activePodcast && activeEpisode && activeEpisode.guid === newestEpisode.episodeGuid) {
					if (activeEpisode.currentTime < newestEpisode.currentTime) {
						state.activeEpisode.currentTime = newestEpisode.currentTime
					}
				}
				else {
					// lastSyncedPodcastState = get().lastSyncedPodcastState;
					
					get().getPodcast(newestEpisode.path)
					.then((podcastData) => {
						// console.log(newestEpisode);
						// console.log(podcastData);
						if (podcastData) {
							if (podcastData.episodes) {
								for (var i=0;i<podcastData.episodes.length;i++) {
									if (podcastData.episodes[i].guid == newestEpisode.episodeGuid) {
										console.log(podcastData);
										console.log(podcastData.episodes[i]);
										set(
											produce((state) => {
												state.activePodcastPath = newestEpisode.path;
												state.activeEpisodeGuid = newestEpisode.episodeGuid;
												state.activePodcast = podcastData;
												state.activeEpisode = podcastData.episodes[i];
											})
										);
										break;
									}
								}
							}
						}
					});
				}
			}

			// Old way
			if (false && response.episodes && response.episodes.length) {
				// Update active episode
				var activeEpisode = get().activeEpisode;

				if (activePodcast && activeEpisode && activeEpisode.guid === newestEpisode.episodeGuid) {
					console.log('updating activeEpisde');
					console.log(activeEpisode);
					if (activeEpisode.currentTime < newestEpisode.currentTime) {
						set(
							produce((state) => {
								state.activeEpisode.currentTime = newestEpisode.currentTime
							})
						)
					}
				}
				else {
					lastSyncedPodcastState = get().lastSyncedPodcastState;

					console.log('newestEpisode');
					console.log(newestEpisode);
					console.log(new Date(newestEpisode.lastUpdated));

					console.log(newestEpisode.lastUpdated);
					console.log(lastSyncedPodcastState);
					console.log(new Date(lastSyncedPodcastState));
					console.log('----------------------');
					console.log(new Date(newestEpisode.lastUpdated).getTime());
					console.log(new Date(newestEpisode.lastUpdated).getTime() > lastSyncedPodcastState);
					
					const assignState = (podcastCache,newestEpisode) => {
						var foundPodcast = false;
						for (const [podcastPath, podcast] of Object.entries(podcastCache)) {
							if (podcast.guid === newestEpisode.podcastGuid) {
								foundPodcast = true;
								
								var foundEpisode = false;
								for (var i=0;i<podcast.episodes.length;i++) {
									if (podcast.episodes[i].guid == newestEpisode.episodeGuid) {
										foundEpisode = true;

										var newActiveEpisode = structuredClone(podcast.episodes[i]);
										newActiveEpisode.currentTime = newestEpisode.currentTime;
										set(
											produce((state) => {
												state.activePodcast = podcast;
												state.activeEpisode = newActiveEpisode;
											})
										)
										break;
									}
								}
								if (!foundEpisode) {
									console.log('Could not find the episode');
								}
								break;
							}
						}
						return foundEpisode;
					};
					
					if (new Date(newestEpisode.lastUpdated).getTime() > lastSyncedPodcastState) {
						var foundPodcast = assignState(podcastCache,newestEpisode);
						if (!foundPodcast) {
							// var path = podcastByGuid[newestEpisode.podcastGuid].path;
							
							get().retrievePodcastFromServer(newestEpisode.path)
							.then((podcast) => {
								console.log('Retrieved podcast, lets try again');
								console.log(podcast);
								podcastCache = get().podcastCache;
								console.log(podcastCache);
								foundPodcast = assignState(podcastCache,newestEpisode);
								if (!foundPodcast) {
									console.log('Still did not find podcast. Giving up');
								}
							});
						}
					}
					
					/*
					for (const [podcastPath, podcast] of Object.entries(podcastCache)) {
						if (podcast.guid === newestEpisode.podcastGuid) {
							for (var i=0;i<podcast.episodes.length;i++) {
								if (podcast.episodes[i].guid == newestEpisode.episodeGuid) {
									console.log('Found a new episode. Setting active episode');
									set(
										produce((state) => {
											state.activeEpisode = podcast.episodes[i]
										})
									)
									break;
								}

							}
							break;
						}
					}
					*/
				}
			}
			set({
				syncingPodcastState: false,
				lastSyncedPodcastState: Date.now()
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

		var activeEpisodeState = get().podcasts[get().activePodcastPath].episodes[get().activeEpisodeGuid];

		// console.log('activeEpisode.listened');
		// console.log(activeEpisode.listened);
		// console.log(activeEpisode);

		// var listened = activeEpisode.listened ? true : percentageListened > 90 ? true : false;
		
		// console.log(listened);

		const episodeData = {
			podcastGuid: activePodcast.guid,
			episodeGuid: activeEpisode.guid,
			currentTime: activeEpisodeState.currentTime,
			listened: activeEpisodeState.listened === true,
			percentageListened: activeEpisodeState.percentageListened
		};
		// console.log(activePodcast);
		// console.log(activeEpisode);
		// console.log(episodeData);

		const episodeSynchronizationURL = 'https://api.podfriend.com/user/sync/episode/';

		console.log('syncing: ' + episodeSynchronizationURL);

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
				synchronizingEpisodeState: false
			});
		});
	}
});