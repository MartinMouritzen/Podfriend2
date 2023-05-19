import { Options, convertFile, determineFormat } from 'transcriptator';

Options.setOptions({
	// combineSegments: true,
	// combineSegmentsLength: 80,
	combineEqualTimes: true
});

class PodcastUtil {
	/**
	*
	**/
	static __fetchTranscript(transcriptUrl,type) {
		return fetch(transcriptUrl)
		.catch((exception) => {
			console.log('CORS on transcript file. Falling back to Proxy.');
			return fetch('https://www.podfriend.com/tmp/rssproxy.php?rssUrl=' + encodeURI(subtitleFile));
		})
		.then((result) => {
			if (type === 'application/json') {
				return result.json();
			}
			return result.text();
		})
		.then((result) => {
			if (type === 'application/srt' || type === 'text/srt') {
				return result;
			}
			else {
				return result;
			}
		})
		.catch((error) => {
			console.log('Error getting transcript file');
			console.log(error);
		});
	}
	/**
	*
	**/
	static async loadTranscript(transcriptUrl,transcriptInfo) {
		return this.__fetchTranscript(transcriptUrl,transcriptInfo.type)
		.then((transcriptData) => {
			var format = determineFormat(transcriptData);
			var segments = convertFile(transcriptData,format);
			return segments;
		});
	}
	/**
	*
	**/
	static async loadChapters(url) {
		// console.log('loading chapters');
		let result = false;

		try {
			result = await fetch(url);
		}
		catch(exception) {
			// console.error('Cors probably missing on chapters, using proxy');
			url = 'https://www.podfriend.com/tmp/rssproxy.php?rssUrl=' + encodeURI(url);

			try {
				result = await fetch(url);
			}
			catch(exception2) {
				console.error('Proxy call to chapters failed.');
				console.error(exception2);
			}
		}
		try {
			let resultJson = await result.json();

			try {
				if (resultJson.chapters && resultJson.chapters.length > 0) {
					var finalChapters = resultJson.chapters;
					for (var i=0;i<finalChapters.length;i++) {
						if (finalChapters[i + 1]) {
							finalChapters[i].endTime = finalChapters[i + 1].startTime;
						}
					}
					return finalChapters;
				}
			}
			catch(exception) {
				console.error('Exception getting chapters from: ' + url);
				console.error(exception);
				return false;
			}
		}
		catch(exception) {
			console.error('Exception parsing chapters');
			console.error(exception);
			console.error(url);
			console.error(result);
			return false;
		}
	};
	/**
	*
	**/
	static parseEpisodes(episodes) {
		if (Array.isArray(episodes)) {
			let seasonCount = 0;
			let rawSeasons = [];
			let trailers = [];
			let podcastSeasonType = 'episodic';

			episodes.forEach((episode,index) => {
				var seasonNumber = 0;

				var episodeSeason = parseInt(episode.season);

				if (episode.episodeType === 'trailer') {
					trailers.push(episode);
				}
				else {
					if (Number.isInteger(episodeSeason)) {
						seasonNumber = episodeSeason;
					}
					if (!Array.isArray(rawSeasons[seasonNumber])) {
						rawSeasons[seasonNumber] = [];
					}
					rawSeasons[seasonNumber].push(episode);
				}
			});
			let seasonNumbers = Object.keys(rawSeasons);
			seasonCount = rawSeasons.length;

			// If it's a seasonal podcast, we want to sort old to new
			if (seasonCount > 1) {
				// setPodcastSeasonType('season');
				podcastSeasonType = 'season';
			}
			else {
				// setPodcastSeasonType('episodic');
				podcastSeasonType = 'episodic';
			}
			// console.log(rawSeasons);
			return {
				seasonCount: seasonCount,
				seasons: rawSeasons,
				trailers: trailers,
				podcastSeasonType: podcastSeasonType
			};
		}
		return false;
	}
}
export default PodcastUtil;