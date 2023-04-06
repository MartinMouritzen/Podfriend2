export const createServerSyncSlice = (set,get) => ({
	syncingPodcastState: false,
	lastSyncedPodcastState: false,
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
			if (Array.isArray(response.podcasts)) {
				var followedPodcasts = get().followedPodcasts;

				response.podcasts.forEach((podcast) => {
					get().followPodcast(podcast);
				});
			}
			if (response.episodes) {
				console.log(response.episodes);
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
	synchronizeEpisodeState: () => {
		return (dispatch,getState) => {
			var activePodcast = get().activePodcast;
			var activeEpisode = get().activeEpisode;

			var percentageListened = (100 * activeEpisode.currentTime) / activeEpisode.duration;

			console.log('activeEpisode.listened');
			console.log(activeEpisode.listened);
			console.log(percentageListened);

			var listened = activeEpisode.listened ? true : percentageListened > 90 ? true : false;
			
			console.log(listened);

			const episodeData = {
				podcastGuid: activePodcast.guid,
				episodeGuid: activeEpisode.guid,
				currentTime: activeEpisode.currentTime,
				listened: listened
			};
			// console.log(activePodcast);
			console.log(activeEpisode);
			console.log(episodeData);

			const episodeSynchronizationURL = 'https://api.podfriend.com/user/sync/episode/';

			/*
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
				console.log(resp);
				return resp.json()
			})
			.then((response) => {
				console.log('episode sync done');
				console.log(response);
			})
			.catch((error) => {
				console.log('error synchronizing episode data.');
				console.log(error);
				console.log(episodeSynchronizationURL);
				console.log(episodeData);
			});
			*/
		};
	}
});