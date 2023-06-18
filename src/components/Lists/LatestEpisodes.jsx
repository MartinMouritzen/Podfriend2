import useStore from 'store/Store';
import PodcastList from './PodcastList';

import { useEffect, useState } from 'react';

import TimeUtil from 'library/TimeUtil';

import { IonSkeletonText } from '@ionic/react';

import PodcastImage from 'components/PodcastImage/PodcastImage';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Navigation, Pagination } from "swiper";

const LatestEpisodes = ({ backButtonText = false }) => {
	const followedPodcasts = useStore((state) => state.followedPodcasts);

	const activeEpisode = useStore((state) => state.activeEpisode);

	const loggedIn = useStore((state) => state.loggedIn);

	const playEpisode = useStore((state) => state.playEpisode);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);

	// const [latestEpisodes,setLatestEpisodes] = useState(false);

	const latestEpisodes = useStore((state) => state.latestEpisodes);
	const refreshingLatestEpisodes = useStore((state) => state.refreshingLatestEpisodes);

	const onPlay = (podcastPath,podcastData,episode,url) => {
		if (activeEpisode.url === url) {
			audioPlay();
		}
		else {
			playEpisode(podcastPath,podcastData,episode.guid,episode.live ? episode : false);
		}
	};
	const onPause = () => {
		audioPause();
	};

	return (
		<div className={'podcastGrid scroll'}>
			{ (latestEpisodes === false || latestEpisodes.length === 0 && refreshingLatestEpisodes) && [...Array(7)].map((e, i) => {
				return (
					<div className="podcastItem" key={'loading' + i}>
						<IonSkeletonText animated={true} className="cover" style={{ minHeight: 208, marginTop: 0 }} ></IonSkeletonText>
						<IonSkeletonText animated={true} style={{ height: 45 }}></IonSkeletonText>
						<IonSkeletonText animated={true} style={{ height: 25 }}></IonSkeletonText>
					</div>
				);
			}) }
			{ latestEpisodes !== false && latestEpisodes.map((episode) => {
				return (
						<div onClick={() => { onPlay(episode.path,false,episode,episode.enclosureUrl) }} className="podcastItem" key={episode.guid ? episode.guid : episode.url}>
							<PodcastImage
								podcastPath={episode.path}
								width={400}
								height={400}
								coverWidth={120}
								coverHeight={120}
								imageErrorText={episode.title}
								src={episode.image ? episode.image : episode.feedImage}
								fallBackImage={false}
								className={'cover'}
								asBackground={true}
								loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
							/>
							{ !!episode.duration &&
								<div className="episodeDuration">{TimeUtil.fancyTimeFormat(episode.duration)}</div>
							}
							<div className='podcastInfo'>
								<div className='title'>
									{episode.title}
								</div>
								
								<div className='author'>
									{episode.name}
								</div>
								
							</div>
						</div>
				);
			})}
		</div>
	);
};
export default LatestEpisodes;