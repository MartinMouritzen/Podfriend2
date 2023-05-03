import { IonMenu, IonTitle, IonSearchbar, IonHeader, IonContent, IonIcon, IonLabel, IonList, IonItem, IonToolbar, IonButtons, IonButton, IonRange, IonSegment, IonSegmentButton, IonSkeletonText, IonChip, IonListHeader, useIonActionSheet, useIonModal } from '@ionic/react';

import useStore from 'store/Store';

import { BREAKPOINTS } from 'constants/breakpoints';
import useBreakpoint from 'use-breakpoint';

import { useEffect, useRef, useState, useCallback } from 'react';

import DraggablePane from 'components/UI/DraggablePane/DraggablePane';

import TimeUtil from 'library/TimeUtil';

import EpisodeList from 'pages/PodcastPage/EpisodeList';

import './player.scss';

import ProgressBar from './ProgressBar.jsx';

import SVG from 'react-inlinesvg';

import PlayIcon from 'images/player/play.svg';
import PauseIcon from 'images/player/pause.svg';
import RewindIcon from 'images/player/rewind-10.svg';
import ForwardIcon from 'images/player/forward-30.svg';
import SkipBackwardIcon from 'images/player/skip-backward.svg';
import SkipForwardIcon from 'images/player/skip-forward.svg';

import {
	ellipsisHorizontal as moreIcon,
	alarmOutline as alarmIcon,
	speedometerOutline as speedIcon,
	shareOutline as shareIcon,
	browsersOutline as goIcon,
	chatboxOutline as chatIcon
} from 'ionicons/icons';

import LoadingIcon from 'images/player/loading.png';
import PlayerPodcastCoverArea from './PlayerPodcastCoverArea';
import EpisodeSecondaryActionToolbar from './EpisodeSecondaryActionToolbar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from "swiper";
import 'swiper/css';
import "swiper/css/pagination";

import ChapterList from 'components/Chapters/ChapterList';
import PodcastImage from 'components/PodcastImage/PodcastImage';
import TranscriptLiveArea from './Transcript/TranscriptLiveArea';
import PodcastUtil from 'library/PodcastUtil';
import ChatModal from "components/Chat/ChatModal";
import AudioSpeedSettingModal from './AudioSpeedSettingModal';

import Events from 'library/Events.js';

const Player = ({ audioController, navigateToPath, platform }) => {
	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const audioElement = useRef(null);
	const scrollChild = useRef(null);

	const activePodcastPath = useStore((state) => state.activePodcastPath);
	const activeEpisodeGuid = useStore((state) => state.activeEpisodeGuid);

	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	const episodeState = useStore((state) => state.podcasts[state.activePodcastPath]?.episodes[state.activeEpisodeGuid]);

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

	const [rssFeedContents,setRssFeedContents] = useState(false);
	const [subtitleFileURL,setSubtitleFileURL] = useState(false);

	const [error,setError] = useState(false);
	const [errorText,setErrorText] = useState(false);

	const [errorRetries,setErrorRetries] = useState(0);

	const [segmentVisible,setSegmentVisible] = useState('playing');

	const [controlledSwiper, setControlledSwiper] = useState(null);

	let fullPlayerOpen = false;
	let hasEpisode = true;

	const onCanPlay = () => {
		audioIsReady();
	};
	const onBuffering = () => {
		audioIsLoading();
	};
	const onLoadedMetadata = () => {
		audioIsReady();
	};
	const onPlay = () => {
		audioPlay();
	};
	const onPause = () => {
		audioPause();
	};
	const onSeek = () => {

	};
	const onTimeUpdate = () => {
		if (!streamDataLoading && shouldPlay) {
			updateProgress();
		}
	};
	const onEnded = () => {

	};
	const onLoadedData = () => {

	};
	const retryAudioOnError = () => {

	}

	const onPauseClicked = () => {
		audioPause();
	};
	const onPlayClicked = () => {
		audioPlay();
	};

	const progressTimeoutId = useRef(null);

	/**
	*
	*/
	const onProgressSliderChange = (value) => {
		var placeInTrack = value * episodeState.duration / 100;

		clearTimeout(progressTimeoutId.current);

		// Make sure we don't overload the html5 component
		progressTimeoutId.current = setTimeout(() => {
			setCurrentTime(placeInTrack);
			resetAudioSegmentTime();
	 	},100);
	}

	const generateTimeHash = () => {
		return '#t=' + Math.round(episodeState && episodeState.currentTime ? episodeState.currentTime : 0);
	};
	const addUserAgentToUrl = (fileUrl) => {
		if (!fileUrl) { return; }
		try {
			const resourceUrl = new URL(fileUrl);
			resourceUrl.searchParams.delete('_from');
			resourceUrl.searchParams.append('_from','podfriend.com');
			resourceUrl.searchParams.append('_guid',activeEpisode.statsId);
			return resourceUrl.toString() + generateTimeHash();
		}
		catch (exception) {
			console.log('addUserAgentToUrlException');
			console.log(exception);
			try {
				var fallbackUrl = fileUrl;
				if (fallbackUrl.includes('?')) {
					fallbackUrl += '&_from=podfriend.com&_guid=' + activeEpisode.statsId;
				}
				else {
					fallbackUrl += '?_from=podfriend.com&_guid=' + activeEpisode.statsId;
				}
				return fallbackUrl;
			}
			catch (exception2) {
				return fileUrl;
			}
		}
	};

	const audioElementProps = {
		key: "audioPlayer",
		id: "player",
		style: { display: isVideo ? 'block' : 'none' },
		onCanPlay: onCanPlay,
		onLoadStart: onBuffering,
		onWaiting: onBuffering,
		onLoadedMetadata: onLoadedMetadata,
		ref: audioElement,
		onPlay: onPlay,
		onPause: onPause,
		onSeeked: onSeek,
		onTimeUpdate: onTimeUpdate,
		onEnded: onEnded,
		onLoadedData: onLoadedData,

		preload: "auto",
		disableRemotePlayback: true,
		onError: (error) => {
			if (activeEpisode && activeEpisode.url) {
				console.log('Error happened in audio element on ' + new Date());
				console.log(error);
				console.log(error.nativeEvent);
				console.log(error.nativeEvent.message);
				console.log(error.nativeEvent.code);
				console.log(error.currentTarget);
			}

			// var errorSpecified = Object.keys(Object.getPrototypeOf(error.currentTarget.error)).find(key => error.currentTarget.error[key] === error.currentTarget.error.code);
			// console.log(errorSpecified);

			// Wait half a second before retrying.
			setTimeout(() => {
				retryAudioOnError();
			},1000);
		},
		onAbort: (error) => { /* console.log('onAbort happened in audio element'); console.log(error); console.log(error.nativeEvent); console.log(error.nativeEvent.message); console.log(error.nativeEvent.code); */ },
		onEmptied: (error) => { /* console.log('onEmptied happened in audio element'); console.log(error); console.log(error.nativeEvent); console.log(error.nativeEvent.message); console.log(error.nativeEvent.code); */  },
		onStalled: (error) => { /* console.log('onStalled happened in audio element'); console.log(error); console.log(error.nativeEvent); console.log(error.nativeEvent.message); console.log(error.nativeEvent.code); */ }
	};

	// So we can access the values in the event handlers.
	const isPlaying = useRef(shouldPlay);

	useEffect(() => {
		isPlaying.current = shouldPlay;
	},[shouldPlay]);

	const playOrPause = useCallback(() => {
		if (isPlaying.current) {
			audioPause();
		}
		else {
			audioPlay();
		}
	},[]);

	useEffect(() => {
		Events.addListener('PodfriendSetCurrentTime',(param) => { if (isNaN(param)) { return; } setCurrentTime(param) },'Player');
		Events.addListener('MediaPlayPause',() => { console.log('MediaPlayPause'); playOrPause();  },'Player');
		Events.addListener('MediaNextTrack',() => {  console.log('MediaNextTrack'); onSkipForward(); },'Player');
		Events.addListener('MediaPreviousTrack',() => { console.log('MediaPreviousTrack'); onSkipBackward(); },'Player');
		Events.addListener('MediaRewindTrack',() => {  console.log('MediaRewindTrack'); onBackward(); },'Player');
		Events.addListener('MediaForwardTrack',() => {  console.log('MediaForwardTrack'); onForward(); },'Player');

		return () => {
			Events.removeListenersInGroup('Player');
		};
	},[]);

	useEffect(() => {
		if (audioElement.current) {
			audioController.setAudioElement(audioElement.current);
		}
	},[audioElement]);

	useEffect(() => {
		audioController.setPlaybackRate(playbackSpeed);
	},[playbackSpeed]);

	useEffect(() => {
		if (audioElement.paused && shouldPlay) {
			console.log('audio element is paused but should be playing');
		}
		if (!audioElement.paused && !shouldPlay) {
			console.log('audio element is playing but should be paused');
		}
	},[audioElement?.paused]);

	useEffect(() => {
		setError(false);
		setErrorText(false);
		setErrorRetries(0);
		setTranscriptData(false);
		setSegmentVisible('playing');
		setChapters(false);
		setRssFeedContents(false);
		setRssFeedCurrentEpisode(false);

		changeActiveEpisode(activePodcast,activeEpisode,episodeState);

		if (activePodcast) {
			retrieveOriginalPodcastFeed(activePodcast.path,activePodcast.feedUrl)
			.then((feed) => {
				console.log('new original feed in player');
				console.log(feed);
				setRssFeedContents(feed);
			});
		}
	},[activeEpisodeGuid]);

	useEffect(() => {
		setSegmentVisible('playing');
	},[fullscreen]);

	const [rssFeedCurrentEpisode,setRssFeedCurrentEpisode] = useState(false);
	
	
	useEffect(() => {
		setRssFeedCurrentEpisode(false);

		if (rssFeedContents && rssFeedContents.items) {
			var foundEpisode = false;

			for(var i=0;i<rssFeedContents.items.length;i++) {
				if (activeEpisode.guid == rssFeedContents.items[i].guid) {
					foundEpisode = true;
					setRssFeedCurrentEpisode(rssFeedContents.items[i]);
					break;
				}
			}
		}
	},[JSON.stringify(rssFeedContents)]);

	useEffect(() => {
		if (rssFeedCurrentEpisode && rssFeedCurrentEpisode.chaptersUrl) {
			PodcastUtil.loadChapters(rssFeedCurrentEpisode.chaptersUrl)
			.then((chapters) => {
				setChapters(chapters);
			});
		}
		if (rssFeedCurrentEpisode && rssFeedCurrentEpisode.transcriptUrl) {
			var useTranscript = false;
			if (Array.isArray(rssFeedCurrentEpisode.transcript)) {
				for(var i=0;i<rssFeedCurrentEpisode.transcript.length;i++) {
					if (rssFeedCurrentEpisode.transcript[i].type == 'application/srt' || rssFeedCurrentEpisode.transcript[i].type == 'text/srt') {
						useTranscript = rssFeedCurrentEpisode.transcript[i];
					}
					else if (rssFeedCurrentEpisode.transcript[i].type == 'application/json' || rssFeedCurrentEpisode.transcript[i].type == 'text/json') {
						useTranscript = rssFeedCurrentEpisode.transcript[i];
					}
				}
				if (!useTranscript) {
					useTranscript = rssFeedCurrentEpisode.transcript[0];
				}
			}
			else {
				if (rssFeedCurrentEpisode.transcript.url && rssFeedCurrentEpisode.transcript.type) {
					useTranscript = {
						url: rssFeedCurrentEpisode.transcript.url,
						type: rssFeedCurrentEpisode.transcript.type
					}
				}
				else {
					useTranscript = {
						url: rssFeedCurrentEpisode.transcriptUrl,
						type: 'text/plain'
					}
				}
			}
			PodcastUtil.loadTranscript(useTranscript.url,useTranscript.type)
			.then((transcriptData) => {
				setTranscriptData(transcriptData);
			});
		}
	},[JSON.stringify(rssFeedCurrentEpisode)]);

	useEffect(() => {
		if (!episodeState) {
			return;
		}
		var foundChapter = false;

		if (episodeState.currentTime > 0) {
			// First we walk through to find the active chapter
			for(var i=0;i<chapters.length;i++) {
				if (chapters[i].startTime <= episodeState.currentTime) {
					// Let's make sure we get the latest chapter
					if (!foundChapter || foundChapter.startTime < chapters[i].startTime) {
						foundChapter = chapters[i];
					}
				}
			}
		}
		if (foundChapter != currentChapter) {
			setCurrentChapter(foundChapter);
		}
	},[JSON.stringify(chapters),Math.round(episodeState?.currentTime)]);

	const navigateToPodcast = () => {
		navigateToPath('/podcast/' + activePodcast.path + '/');
		if (fullscreen) {
			minimize();
		}
	};

	useEffect(() => {
		if (segmentVisible === 'playing') {
			controlledSwiper?.slideTo(0, 300);
		}
		else if (segmentVisible === 'info') {
			controlledSwiper?.slideTo(1, 300);
		}
		else if (segmentVisible === 'chapters') {
			controlledSwiper?.slideTo(2, 300);
		}
	},[segmentVisible]);

	var playerStyle = {};

	const [actionSheetPresent] = useIonActionSheet();
	const showMoreSheet = () => {
		actionSheetPresent({
			buttons: [
				{
					text: 'Set audio speed',
					icon: speedIcon,
					data: {
						action: 'playbackSpeed'
					}
				},
				{
					text: 'Set sleep timer',
					icon: alarmIcon,
					data: {
						action: 'sleepTimer'
					}
				},
				{
					text: 'Share episode',
					icon: shareIcon,
					data: {
						action: 'share'
					}
				},
				/*
				{
					text: 'Add season to playlist',
					data: {
						action: 'share',
					},
				},
				*/
				{
					text: 'Cancel',
					role: 'cancel',
					data: {
						action: 'cancel',
					},
				},
			],
			onWillDismiss: ({ detail }) => {
				if (detail?.data?.action === 'website') {
					// window.open(activePodcast.link,"_blank");
				}
				else if (detail?.data?.action === 'playbackSpeed') {
					openPlaybackSpeedModal();
				}
				else if (detail?.data?.action === 'sleepTimer') {

				}
				else if (detail?.data?.action === 'share') {

				}
			},
			onDidDismiss: ({ detail }) => {
				
			},
		})
	};

	const [playbackSpeedModalPresent, playbackSpeedModalDismiss] = useIonModal(AudioSpeedSettingModal, {
		onDismiss: (data, role) => playbackSpeedModalDismiss(data, role)
	});

	const openPlaybackSpeedModal = () => {
		playbackSpeedModalPresent({
			initialBreakpoint: 0.5,
			breakpoints: [0, 0.5,1],
			canDismiss: true
		});
	};

	const [presentChatModal, dismissChatModal] = useIonModal(ChatModal, {
		onDismiss: (data, role) => dismissChatModal(data, role)
	});

	const openChatModal = () => {
		presentChatModal({
			keepContentsMounted: true,
			onWillDismiss: (event) => {
			  
			},
		});
	};

	return (
		<>
			<div
				className="openPlayerBackground"
				style={{
					display: (fullscreen ? 'block' : 'none')
				}}
				onClick={() => { minimize(); }}
			/>
			<DraggablePane
				onOpen={maximize}
				onHide={minimize}
				open={fullscreen}
				className={'player ' + (fullscreen ? 'fullscreen' : 'mini') + ' ' + (shouldPlay ? ' ' + 'playing' : ' ' + 'notPlaying') + (activePodcastPath ? '' : ' noPodcastPlaying') + (activeEpisode.live ? ' liveEpisode' : '')}
				style={playerStyle}
				platform={platform}
			>
				{ audioController.useBrowserAudioElement === true &&
					<audio {...audioElementProps}>
						<source src={addUserAgentToUrl(activeEpisode.url)} type={activeEpisode.type ? activeEpisode.type : 'audio/mpeg'} />
					</audio>
				}
				<div className="mainPlayerComponents">
					<div className="segmentContainer" style={{ display: (fullscreen ? 'block' : 'none') }}>
						<IonSegment value={segmentVisible} onIonChange={(e) => { setSegmentVisible(e.detail.value); console.log(e.detail.value); }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
							<IonSegmentButton value="playing">
								<IonLabel>
									Playing
								</IonLabel>
							</IonSegmentButton>
							<IonSegmentButton value="info">
								<IonLabel>Info</IonLabel>
							</IonSegmentButton>
							{ chapters &&
								<IonSegmentButton value="chapters">
									<IonLabel>Chapters</IonLabel>
								</IonSegmentButton>
							}
							{ false &&
								<IonSegmentButton value="chat">
									<IonLabel>Chat</IonLabel>
								</IonSegmentButton>
							}
						</IonSegment>
					</div>

					{ fullscreen &&
						<>
							{ false && 
								<div>
									<IonChip>Now playing</IonChip>
									<IonChip>Info</IonChip>
									<IonChip>Chat</IonChip>
									<IonChip>Chapters</IonChip>
								</div>
							}
							<div className="podcastInfo">
								<div className="episodeTitle" title={activeEpisode.title}>
									{activeEpisode.title}
								</div>
								<div className="podcastName">
									<>{activePodcast.name}</>
								</div>
							</div>
							<div className="swipeableContent" style={{ width: '100vw' }}>
								<Swiper
									cssMode={true}
									spaceBetween={0}
									slidesPerView={1}
									pagination={{
										clickable: true,
									}}
									modules={[Pagination]}
									onSwiper={setControlledSwiper}
								>
									<SwiperSlide>
										<div className="swipeContents playingCoverArea">
											<div className="playerCoverContainer" onClick={maximize}>
												{ activeEpisode &&
													<PlayerPodcastCoverArea 
														podcast={activePodcast}
														episode={activeEpisode}
														audioController={audioController}
														chapters={chapters}
														currentChapter={currentChapter}
													/>
													
												}
											</div>
											{ currentChapter &&
												<>
													<div className="chapterPlayingTitle">
														{currentChapter.title}
													</div>
													<div className="chapterPlayingPeriod">
														{TimeUtil.fancyTimeFormat(currentChapter.startTime)} - {TimeUtil.fancyTimeFormat(currentChapter.endTime)}
													</div>
												</>
											}
										</div>
									</SwiperSlide>
									<SwiperSlide>
										<div className="description">
											<h2>Description</h2>
											<div dangerouslySetInnerHTML={{__html: activeEpisode.safeDescription}}>
											</div>
										</div>
									</SwiperSlide>
									{ chapters &&
										<SwiperSlide>
											<div className="swipeContents">
												<ChapterList
													chapters={chapters}
													currentChapter={currentChapter}
												/>
											</div>
										</SwiperSlide>
									}
								</Swiper>
							</div>
							{ transcriptData &&
								<TranscriptLiveArea rssFeedCurrentEpisode={rssFeedCurrentEpisode} transcriptData={transcriptData} currentTime={episodeState.currentTime} podcast={activePodcast} chapters={chapters} setCurrentTime={setCurrentTime} />
							}
							{ false &&
								<div style={{ color: '#000000', padding: 10 }}>
									Comments
								</div>
							}
						</>
					}
					{ !fullscreen &&
						<div className="playerCoverContainer" onClick={maximize}>
							{ activeEpisode &&
								<PodcastImage
									podcastPath={activePodcast.path}
									width={600}
									height={600}
									coverWidth={50}
									coverHeight={50}
									imageErrorText={activePodcast.name}
									fallBackImage={activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
									src={activeEpisode.image ? activeEpisode.image : activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
									className={''}
									// imageRef={coverImageRef}
									loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
								/>
								
							}
						</div>
					}
					<div className="controls">
						<div className='titleAndButtons'>
							{ !fullscreen &&
								<div className="podcastInfo">
									<div className="episodeTitle">
										{activeEpisode.title}
									</div>
									<div className="podcastName">
										<>{activePodcast.name}</>
									</div>
								</div>
							}
							<div className="progressAndControls">
								<div className="progressBar">
									<div className="progressText">
										{TimeUtil.formatPrettyDurationText(episodeState?.currentTime)}
									</div>
									<ProgressBar
										progress={episodeState?.currentTime}
										duration={episodeState?.duration}
										onProgressSliderChange={onProgressSliderChange}
									/>
									<div className="durationText" title={TimeUtil.formatPrettyDurationText(episodeState?.duration - episodeState?.progress) + ' left.'}>
										{TimeUtil.formatPrettyDurationText(episodeState?.duration)}
									</div>
								</div>
								<div className="playerControls">
									{ (activeEpisode.live && activeEpisode.chat) &&
										<div className="button buttonChat" onClick={openChatModal}><IonIcon icon={chatIcon} /></div>
									}
									<div className="button buttonFiller">&nbsp;</div>
									<div className="button buttonSkipBackward" onClick={onSkipBackward}><SVG src={SkipBackwardIcon} /></div>
									<div className="button buttonRewind" onClick={onBackward}><SVG src={RewindIcon} /></div>
									{ streamDataLoading &&
										<div className="button buttonLoad" onClick={onPauseClicked}  ><img src={LoadingIcon} /></div>
									}
									{ streamDataLoading === false &&
										<>
										{ shouldPlay &&
											<div className="button buttonPause" onClick={onPauseClicked} ><SVG src={PauseIcon} /></div>
										}
										{ shouldPlay === false &&
											<div className="button buttonPlay" onClick={onPlayClicked} ><SVG src={PlayIcon} /></div>
										}
										</>
									}
									<div className="button buttonForward" onClick={onForward}><SVG src={ForwardIcon} /></div>
									<div className="button buttonSkipForward" onClick={onSkipForward}><SVG src={SkipForwardIcon} /></div>
									<div className="button buttonMore" onClick={showMoreSheet}><IonIcon icon={moreIcon} /></div>
									{ !fullscreen &&
										<div className="button navigateToPodcastButton" onClick={navigateToPodcast}>
											<PodcastImage
												podcastPath={activePodcast.path}
												width={120}
												height={120}
												coverWidth={30}
												coverHeight={30}
												imageErrorText={activePodcast.name}
												fallBackImage={activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
												src={activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
												className={'podcastThumbnail'}
												loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
											/>
										</div>
									}
								</div>
							</div>
						</div>
					</div>
				</div>
				{ fullscreen &&
					<EpisodeSecondaryActionToolbar activePodcast={activePodcast} activeEpisode={activeEpisode} navigateToPodcast={navigateToPodcast} openChatModal={openChatModal} />
				}
				{ (false && fullscreen) &&
					<div className="episodeContent">
						<IonList>
							<IonListHeader>Coming up</IonListHeader>
							<IonList>Episode</IonList>
						</IonList>
						Feed here, which includes Boostogram comments, boosts and other timeline events for the episode<br /><br />
						For example &quot;Martin streamed 543 sats to the show.&quot; if only one friend streamed, and &quot;4 Friends streamed to this show&quot; if more than eg. 2 or 3 did it.

						<div>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
							<p>test, test test, test test, test test, test test, test test, test test, test test, test</p>
						</div>
					</div>
				}
			</DraggablePane>
		</>
	);
};

export default Player;