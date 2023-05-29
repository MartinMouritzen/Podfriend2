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


	if (continueListeningEpisodeList === false || !continueListeningEpisodeList.length || continueListeningEpisodeList.length === 0) {
		return (
			<div className="emptyListenDiv">
				Your queue is currently empty.
			</div>
		);
	}

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
			modules={[Navigation]}

			className="coverSwiper"
		>
			{ continueListeningEpisodeList !== false && continueListeningEpisodeList.map((continueListeningEpisode) => {
				return (
					<SwiperSlide key={continueListeningEpisode.episodeGuid}>
						<ContinueListeningEpisode
							podcastPath={continueListeningEpisode.path}
							continueListeningEpisode={continueListeningEpisode}
						/>
					</SwiperSlide>
				);
			})}
			<div className="swiper-button-prev"></div>
			<div className="swiper-button-next"></div>
		</Swiper>
	);
};
const ContinueListeningEpisode = ({ podcastPath, continueListeningEpisode }) => {
	const deletePodcastFromContinueListeningList = useStore((state) => state.deletePodcastFromContinueListeningList);

	const playEpisode = useStore((state) => state.playEpisode);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);
	const activeEpisode = useStore((state) => state.activeEpisode);

	var podcastPath = continueListeningEpisode.podcastPath;
	var episodeGuid = continueListeningEpisode.episodeGuid;

	const onPlay = (podcastPath,episode) => {
		if (activeEpisode.guid === episodeGuid) {
			audioPlay();
		}
		else {
			playEpisode(podcastPath,false,episodeGuid,episode.live ? episode : false);
		}
	};
	const onPause = () => {
		audioPause();
	};

	const podcastData =  useStore((state) => state.podcasts[podcastPath]);

	if (!podcastData) {
		return null;
	}

	const episode = podcastData.episodes[episodeGuid];
	if (!episode) {
		return null;
	}

	const timeLeft = episode.duration - episode.currentTime;

	return (
		<div onClick={() => { onPlay(podcastPath,episode) }} className={'podcastItem hasProgressBar expandedEpisode' + (activeEpisode.guid === episodeGuid ? ' active' : '')}>
			<div className="deleteFromList" onClick={(event) => { event.stopPropagation(); event.preventDefault(); deletePodcastFromContinueListeningList(episodeGuid); return false; }}>
				<IonIcon icon={removeIcon} />
			</div>
			<PodcastImage
				podcastPath={podcastData.podcastPath}
				width={400}
				height={400}
				coverWidth={120}
				coverHeight={120}
				imageErrorText={continueListeningEpisode.title}
				src={continueListeningEpisode.image ? continueListeningEpisode.image : podcastData.image}
				fallBackImage={false}
				className={'cover'}
				asBackground={true}
				loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
			/>
			{ !!episode.duration &&
				<div className="episodeDuration">{TimeUtil.fancyTimeLeft(timeLeft)} left</div>
			}
			{ (episode.duration && !episode.live) && 
				<div className="episodeProgressBarOuter">
					{ !!episode.listenedPercentage &&
						<div className="episodeProgressBarInner" style={{ width: Math.round(episode.listenedPercentage) + '%' }} />
					}
				</div>
			}
			<div className='podcastInfo'>
				<div className="podcastName">{podcastData.name}</div>
				<div className='title'>
					{continueListeningEpisode.title}
				</div>
				<div className='description' dangerouslySetInnerHTML={{__html:continueListeningEpisode.description}}>

				</div>
				
					<div className='author'>
						{ episode.duration &&
							<>{TimeUtil.fancyTimeFormat(episode.duration)}</>
						}
						{ (!episode.duration && episode.live) && 
							<>Live episode</>
						}
					</div>
				
			</div>
		</div>
	);
};
export default ContinueListening;