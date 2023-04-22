import { IonButton, IonChip, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonSegment, IonSegmentButton, IonSkeletonText, IonTitle, IonToolbar } from "@ionic/react";
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
	chatbubblesOutline as commentsIcon,
	bookmarksOutline as chaptersIcon,
	documentTextOutline as transcriptIcon,
	micSharp as companyIcon,
	playCircle as playIcon,
	pauseCircle as pauseIcon
} from 'ionicons/icons';

import useStore from 'store/Store';

import './EpisodePage.scss';

const EpisodePage = ({ match, audioController }) => {
	const podcastPath = match.params.podcastPath;
	const episodeId = match.params.episodeId;

	const [episode,setEpisode] = useState(false);
	const [podcast,setPodcast] = useState(false);

	const location = useLocation();

	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const audioElement = useRef(null);
	const scrollChild = useRef(null);

	const getPodcastFromCache = useStore((state) => state.getPodcastFromCache);
	const shouldPodcastUpdate = useStore((state) => state.shouldPodcastUpdate);
	const retrievePodcastFromServer = useStore((state) => state.retrievePodcastFromServer);

	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	const retrieveOriginalPodcastFeed = useStore((state) => state.retrieveOriginalPodcastFeed);

	const shouldPlay = useStore((state) => state.shouldPlay);

	const playbackSpeed = useStore((state) => state.playbackSpeed);	

	const audioIsLoading = useStore((state) => state.audioIsLoading);
	const audioIsReady = useStore((state) => state.audioIsReady);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);

	const updateProgress = useStore((state) => state.updateProgress);
	const streamDataLoading = useStore((state) => state.streamDataLoading);

	const playEpisode = useStore((state) => state.playEpisode);

	const [chapters,setChapters] = useState(false);
	const [transcriptData,setTranscriptData] = useState(false);

	const [chaptersLoading,setChaptersLoading] = useState(true);
	const [currentChapter,setCurrentChapter] = useState(false);

	const [subtitleFileURL,setSubtitleFileURL] = useState(false);

	useEffect(() => {
		if (podcast && podcast.episodes) {
			podcast.episodes.forEach((episode) => {
				if (episode.guid === episodeId) {
					setEpisode(episode);
				}
			});
		}
	},[podcast?.path]);

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

	const onPauseClick = () => {
		audioPause();
	}
	const onPlayClick = () => {
		if (activeEpisode.url === episode.url) {
			audioPlay();
		}
		else {
			playEpisode(podcast,episode.url);
		}
	}

	// Hack for now, we need to do it in the actual code when parsing.
	useEffect(() => {
		setTimeout(() => {
			document.querySelectorAll(".description a").forEach(a => a.setAttribute("target", "_blank"))
		},1000);
	},[]);

	const backButtonText = location?.state?.podcast ? location.state.podcast.name : podcast ? podcast.name : 'Back';

	return (
		<Page className="episodePage greyPage" defaultHeader={false} defaultHref={'/podcast/' + podcastPath} title={episode ? episode.title : 'Loading...'} backButtonText={backButtonText}>
			<div className="episodePageContent">
				<div className="episodeHeader">
					<div className="episodeHeaderInner">
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
													{episode?.title}
												</div>
											</>
										}
									</IonTitle>
								</IonToolbar>
							</IonHeader>
							<h3>{podcast?.name}</h3>
							<div style={{ marginTop: 10, color: '#666666' }}>
								Episode released {new Date(episode.date).toLocaleDateString(false,{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
							</div>
							{ episode === false &&
								<IonSkeletonText />
							}
							{ episode !== false &&
								<div className="episodeButtons">
									{ (shouldPlay && activeEpisode.url === episode.url) &&
										<IonButton onClick={onPauseClick}>
											<IonIcon icon={pauseIcon} slot="start" />
											Pause episode
										</IonButton>
									}
									{ (!shouldPlay || (activeEpisode.url !== episode.url)) &&
										<IonButton onClick={onPlayClick}>
											<IonIcon icon={playIcon} slot="start" />
											Play episode
										</IonButton>	
									}
								</div>
							}
						</div>
					</div>
				</div>
				<div className="episodeContents">
{ false &&
					<IonList lines="full" inset={true}>
						<IonItem detail={true}>
							<IonIcon icon={commentsIcon} slot="start" />
							<IonLabel>Comments</IonLabel>
						</IonItem>
						<IonItem detail={true}>
							<IonIcon icon={transcriptIcon} slot="start" />
							<IonLabel>Transcript</IonLabel>
						</IonItem>
						<IonItem detail={true}>
							<IonIcon icon={chaptersIcon} slot="start" />
							<IonLabel>Chapters</IonLabel>
						</IonItem>
					</IonList>
}
					<h2>Episode description</h2>
					<div className="description contentCard" dangerouslySetInnerHTML={{__html:episode?.safeDescription}}>
						
					</div>

	
				</div>
			</div>
		</Page>
	);
};
export default EpisodePage;