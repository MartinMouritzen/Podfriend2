import { IonChip, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonSkeletonText, IonTitle, IonToolbar } from "@ionic/react";
import Page from "components/Page/Page"

import { useEffect, useState, useRef } from 'react';
import { useLocation } from "react-router-dom";

import useStore from 'store/Store';

import { BREAKPOINTS } from 'constants/breakpoints';
import useBreakpoint from 'use-breakpoint';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from "swiper";
import 'swiper/css';
import "swiper/css/pagination";

import PlayerPodcastCoverArea from "components/Player/PlayerPodcastCoverArea";
import TranscriptLiveArea from "components/Player/Transcript/TranscriptLiveArea";

import {
	earthSharp as websiteIcon,
	micSharp as companyIcon,
} from 'ionicons/icons';

import useStore from 'store/Store';

import './EpisodePage.scss';

const EpisodePage = ({ match, audioController }) => {
	const podcastPath = match.params.podcastPath;
	const episodeId = match.params.episodeId;

	const [episode,setEpisode] = useState();
	const [podcast,setPodcast] = useState();

	const location = useLocation();

	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const audioElement = useRef(null);
	const scrollChild = useRef(null);

	const retrievePodcastFromServer = useStore((state) => state.retrievePodcastFromServer);

	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	const retrieveOriginalPodcastFeed = useStore((state) => state.retrieveOriginalPodcastFeed);

	const fullscreen = useStore((state) => state.playerFullscreen);
	const maximize = useStore((state) => state.playerMaximize);
	const minimize = useStore((state) => state.playerMinimize);

	const shouldPlay = useStore((state) => state.shouldPlay);

	const playbackSpeed = useStore((state) => state.playbackSpeed);	

	const audioIsLoading = useStore((state) => state.audioIsLoading);
	const audioIsReady = useStore((state) => state.audioIsReady);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);

	const updateProgress = useStore((state) => state.updateProgress);
	const streamDataLoading = useStore((state) => state.streamDataLoading);

	const setCurrentTime = useStore((state) => state.setCurrentTime);

	const resetAudioSegmentTime = useStore((state) => state.resetAudioSegmentTime);
	
	const onBackward = useStore((state) => state.audioBackward);
	const onForward = useStore((state) => state.audioForward);
	const onSkipBackward = useStore((state) => state.audioSkipBackward);
	const onSkipForward = useStore((state) => state.audioSkipForward);

	const changeActiveEpisode = useStore((state) => state.changeActiveEpisode);

	const [isVideo,setIsVideo] = useState(false);

	const [chapters,setChapters] = useState(false);
	const [transcriptData,setTranscriptData] = useState(false);

	const [chaptersLoading,setChaptersLoading] = useState(true);
	const [currentChapter,setCurrentChapter] = useState(false);

	const [subtitleFileURL,setSubtitleFileURL] = useState(false);

	const [error,setError] = useState(false);
	const [errorText,setErrorText] = useState(false);

	const [errorRetries,setErrorRetries] = useState(0);

	const [segmentVisible,setSegmentVisible] = useState('playing');

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
		<Page className="episodePage" defaultHeader={false} defaultHref={'/podcast/' + podcastPath} title={episode ? episode.title : 'Loading...'} backButtonText={backButtonText}>
			<div className="episodePageContent">
				<div className="episodeHeader">
					<div className="playerCoverContainer">
						{ episode &&
							<PlayerPodcastCoverArea
								podcast={podcast}
								episode={episode}
								audioController={audioController}
								chapters={chapters}
								currentChapter={currentChapter}
							/>
							
						}
					</div>
				</div>
				<div className="episodeContents">
					<div className="episodeHeaderText">
						<IonChip>Episode</IonChip>
						<IonHeader collapse="condense">
							<IonToolbar>
								<IonTitle size="large">
									{ !podcast &&
										<IonSkeletonText animated={true} style={{ width: '90vw', height: 26 }}></IonSkeletonText>
									}
									{ podcast &&
										<>
										<div className="ion-text-wrap">
											{episode.title}
											</div>
										</>
									}
								</IonTitle>
							</IonToolbar>
						</IonHeader>
					</div>
					<div className="description">
						{podcast?.description}
					</div>
					<IonList lines="full" inset={true}>
						<IonItem detail={true}>
							<IonIcon icon={websiteIcon} slot="start" />
							<IonLabel>Comments</IonLabel>
						</IonItem>
						<IonItem detail={true}>
							<IonIcon icon={websiteIcon} slot="start" />
							<IonLabel>Transcript</IonLabel>
						</IonItem>
						<IonItem detail={true}>
							<IonIcon icon={websiteIcon} slot="start" />
							<IonLabel>Chapters</IonLabel>
						</IonItem>
					</IonList>
	
				</div>
			</div>
		</Page>
	);
};
export default EpisodePage;