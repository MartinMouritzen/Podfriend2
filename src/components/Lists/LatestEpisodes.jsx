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
	const retrieveLatestEpisodes = useStore((state) => state.retrieveLatestEpisodes);

	const activeEpisode = useStore((state) => state.activeEpisode);

	const playEpisode = useStore((state) => state.playEpisode);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);

	// const [latestEpisodes,setLatestEpisodes] = useState(false);

	const latestEpisodes = useStore((state) => state.latestEpisodes);

	const onPlay = (podcastPath,podcastData,episode,url) => {
		if (activeEpisode.url === url) {
			audioPlay();
		}
		else {
			playEpisode(false,url,episode.live ? episode : false,podcastPath);
		}
	};
	const onPause = () => {
		audioPause();
	};

	useEffect(() => {
		retrieveLatestEpisodes();
		/*
		.then((episodes) => {
			setLatestEpisodes(episodes);
		})
		.catch((exception) => {
			console.log('exception in latestEpisodes');
			console.log(exception);
		});
		*/
	},[]);

	return (
		<Swiper
			slidesPerView='auto'
			slidesPerGroup={1}
			slidesPerGroupAuto={true}
			spaceBetween={10}
			slidesOffsetBefore={10}
			slidesOffsetAfter={10}
			/* navigation={('ontouchstart' in window ? false : true)} */
			navigation={{
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			}}
			pagination={{
				clickable: true,
			}}
			modules={[Navigation, Pagination]}
			className="coverSwiper"
		>
			{ latestEpisodes !== false && latestEpisodes.map((episode) => {
				return (
					<SwiperSlide key={episode.guid ? episode.guid : episode.url}>
						<div onClick={() => { onPlay(episode.path,false,episode,episode.enclosureUrl) }} className="podcastItem">
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
					</SwiperSlide>
				);
			})}
			<div className="swiper-button-prev"></div>
			<div className="swiper-button-next"></div>
		</Swiper>
	);
};
export default LatestEpisodes;