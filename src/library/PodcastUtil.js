class PodcastUtil {
	static parseEpisodes(episodes) {
		console.log(episodes);
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