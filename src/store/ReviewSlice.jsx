var reviewsAbortController = new AbortController();

import { format } from 'date-fns';

import ClientStorage from './ClientStorage';

export const createReviewSlice = (set, get) => ({
	fetchingReviews: false,
	loadReviewsCache: (podcastGuid) => {
		return ClientStorage.getItem('podcast_reviews_cache_' + podcastGuid)
		.then((reviewsCache) => {
			var shouldUpdate = false;

			shouldUpdate = true;

			if (reviewsCache) {
				if (!reviewsCache.receivedFromServer) {
					console.log('strange, no reviewsCache.receivedFromServer in reviews. This should not happen.');
					shouldUpdate = true;
				}
				else {
					var minutesSinceLastUpdate = Math.floor((Math.abs(new Date() - reviewsCache.receivedFromServer)/1000)/60);
				
					if (isNaN(minutesSinceLastUpdate) || minutesSinceLastUpdate > 5) {
						console.log('More than 5 minutes since last update. Fetching new version of reviews for podcast with guid: ' + podcastGuid);
						shouldUpdate = true;
					}
				}
				return reviewsCache;
			}
			else {
				console.log('Reviews did not have a cached version');
				shouldUpdate = true;
			}
		});

	},
	loadReviews: (podcastGuid) => {
		console.log('loading reviews');
		if (get().fetchingReviews) {
			console.log('was fetching reviews, aborted old request');
			reviewsAbortController.abort();
		}

		set({
			fetchingReviews: true
		});
		

		console.log('updating reviews');
		var podcastAPIURL = "https://api.podfriend.com/podcast/reviews/?podcastGuid=" + podcastGuid;

		reviewsAbortController = new AbortController();
		return fetch(podcastAPIURL, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			},
			signal: reviewsAbortController.signal
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			if (data.error) {
				console.log('Error fetching reviews in Redux::loadReviews');
				console.log(data.error);
				
				return Promise.reject("Failed to load reviews.");
			}
			else {
				data.receivedFromServer = new Date();

				console.log(data);
				
				for (var i=0;i<data.reviews.length;i++) {
					data.reviews[i].reviewDate = new Date(data.reviews[i].reviewDate); // format(, 'yyyy-MM-dd HH-mm-ss'); // format(data.reviews[i].reviewDate);
				}
				
				ClientStorage.setItem('podcast_reviews_cache_' + podcastGuid,data);

				return Promise.resolve(data);
			}
		})
		.catch((error) => {
			console.log('Error2 fetching podcast in Redux::loadReviews: ' + error);
			console.log('We should not dispatch a redux error if this is an abort.');
			console.log(error);
			
			return Promise.reject("Failed to load reviews.");
		})
	}
});