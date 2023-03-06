import Page from "components/Page/Page"

import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";

const EpisodePage = ({ match }) => {
	const podcastPath = match.params.podcastPath;
	const episodeId = match.params.episodeId;

	const [episode,setEpisode] = useState();
	const [podcast,setPodcast] = useState();

	const location = useLocation();
	console.log(location);

	useEffect(() => {
		if (location.state && location.state.podcast && location.state.episode) {
			setPodcast(location.state.podcast);
			setEpisode(location.state.episode);
		}
	},[location]);

	return (
		<Page defaultHeader={false} title={episode ? episode.title : 'Loading...'} backButtonText={(podcast ? podcast.name : 'Back')}>
			<div>Episode</div>
			{podcastPath}
			{decodeURIComponent(episodeId)}
		</Page>
	);
};
export default EpisodePage;