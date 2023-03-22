import Page from "components/Page/Page"

import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

import useStore from 'store/Store';

const EpisodePage = ({ match }) => {
	const podcastPath = match.params.podcastPath;
	const episodeId = match.params.episodeId;

	const activePodcast = useStore((state) => state.activePodcast);

	const [episode,setEpisode] = useState();
	const [podcast,setPodcast] = useState();

	const location = useLocation();

	useEffect(() => {
		if (location.state && location.state.podcast && location.state.episode) {
			setPodcast(location.state.podcast);
			setEpisode(location.state.episode);
		}
		else {
			setPodcast(false);
	
			try {
				if (activePodcast.path === podcastPath) {
					setPodcast(activePodcast);
				}
				getPodcastFromCache(podcastPath)
				.then((podcastCache) => {
					if (podcastCache) {
						setPodcast(podcastCache);
					}
					var shouldUpdate = shouldPodcastUpdate(podcastCache);
			
					if (shouldUpdate) {
						retrievePodcastFromServer(podcastPath,podcastCache)
						.then((podcastDataFromServer) => {
							setPodcast(podcastDataFromServer);
						})
						.catch((error) => {
							console.log('Error2 fetching podcast in EpisodePage::fetchPodcast: ' + error);
							console.log(error);
							
							throw error;
						});
					}
				})
				.catch((exception) => {
					console.log('Error in episodePage:getPodcast (2)');
					console.log(exception);
				});
			}
			catch (exception) {
				console.log('Error in episodePage:getPodcast');
				console.log(exception);
			}
		}
	},[location]);

	const backButtonText = location?.state?.podcast ? location.state.podcast.name : podcast ? podcast.name : 'Back';

	return (
		<Page defaultHeader={false} defaultHref={'/podcast/' + podcastPath} title={episode ? episode.title : 'Loading...'} backButtonText={backButtonText}>
			<div>Episode</div>
			{podcastPath}
			{decodeURIComponent(episodeId)}
			{ podcast?.name }
			<div>
				{podcast?.description}
			</div>
		</Page>
	);
};
export default EpisodePage;