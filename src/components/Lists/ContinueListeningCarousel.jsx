import useStore from 'store/Store';
import PodcastList from './PodcastList';

import TimeUtil from 'library/TimeUtil';

import { IonChip, IonIcon, IonSkeletonText } from '@ionic/react';

import {
	close as removeIcon
} from 'ionicons/icons';


import PodcastImage from 'components/PodcastImage/PodcastImage';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Navigation, Pagination } from "swiper";

const ContinueListening = ({ backButtonText = false }) => {
	const continueListeningEpisodeList = useStore((state) => state.continueListeningEpisodeList);
	const deletePodcastFromContinueListeningList = useStore((state) => state.deletePodcastFromContinueListeningList);

	const playEpisode = useStore((state) => state.playEpisode);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);
	const activeEpisode = useStore((state) => state.activeEpisode);

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
			{ continueListeningEpisodeList !== false && continueListeningEpisodeList.map((podcastData) => {
				const episode = podcastData.episode;
				const timeLeft = podcastData.episode.duration - podcastData.episode.currentTime;

				return (
					<SwiperSlide key={episode.guid ? episode.guid : episode.url}>
						<div onClick={() => { onPlay(podcastData.podcastPath,podcastData,episode,episode.url) }} className={'podcastItem hasProgressBar expandedEpisode'}>
							<div className="deleteFromList" onClick={(event) => { event.stopPropagation(); event.preventDefault(); deletePodcastFromContinueListeningList(episode); return false; }}><IonIcon icon={removeIcon} /></div>
							<PodcastImage
								podcastPath={podcastData.podcastPath}
								width={400}
								height={400}
								coverWidth={120}
								coverHeight={120}
								imageErrorText={episode.title}
								src={episode.image ? episode.image : podcastData.podcast ? podcastData.podcast?.artworkUrl600 ? podcastData.podcast?.artworkUrl600 : podcastData.podcast?.image : false}
								fallBackImage={false}
								className={'cover'}
								asBackground={true}
								loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
							/>
							{ !!podcastData.episode.duration &&
								<div className="episodeDuration">{TimeUtil.fancyTimeFormat(podcastData.episode.duration)}</div>
							}
							{ (podcastData.episode.duration && !podcastData.episode.live) && 
								<div className="episodeProgressBarOuter">
									{ !!podcastData.episode.listenedPercentage &&
										<div className="episodeProgressBarInner" style={{ width: Math.round(podcastData.episode.listenedPercentage) + '%' }} />
									}
								</div>
							}
							<div className='podcastInfo'>
								<div className="podcastName">{podcastData.podcastName}</div>
								<div className='title'>
									{podcastData.episode.title}
								</div>
								<div className='description'>
									{podcastData.episode.descriptionNoHTML}
								</div>
								
									<div className='author'>
										{ podcastData.episode.duration &&
											<>{TimeUtil.fancyTimeLeft(timeLeft)} left</>
										}
										{ (!podcastData.episode.duration && podcastData.episode.live) && 
											<>Live episode</>
										}
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
export default ContinueListening;