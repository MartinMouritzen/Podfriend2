import { useState } from 'react';

import useStore from 'store/Store';
import PodcastList from './PodcastList';

const TrendingPodcasts = ({ backButtonText = false }) => {
	const refreshTrendingPodcasts = useStore((state) => state.refreshTrendingPodcasts);
	const [trendingPodcasts,setTrendingPodcasts] = useState(false);

	refreshTrendingPodcasts()
	.then(setTrendingPodcasts);

	return (
		<div>
			<PodcastList backButtonText={backButtonText} podcasts={trendingPodcasts} />
		</div>
	);
};
export default TrendingPodcasts;