import useStore from 'store/Store';
import PodcastList from './PodcastList';

const TrendingPodcasts = ({ backButtonText = false }) => {
	const refreshTrendingPodcasts = useStore((state) => state.refreshTrendingPodcasts);
	const trendingPodcasts = useStore((state) => state.trendingPodcasts);

	refreshTrendingPodcasts();

	return (
		<div>
			<PodcastList backButtonText={backButtonText} podcasts={trendingPodcasts} />
		</div>
	);
};
export default TrendingPodcasts;