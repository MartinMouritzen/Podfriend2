import useStore from 'store/Store';
import PodcastList from './PodcastList';

const TrendingPodcasts = () => {
	const refreshTrendingPodcasts = useStore((state) => state.refreshTrendingPodcasts);
	const trendingPodcasts = useStore((state) => state.trendingPodcasts);

	refreshTrendingPodcasts();

	return (
		<div>
			<PodcastList podcasts={trendingPodcasts} />
		</div>
	);
};
export default TrendingPodcasts;