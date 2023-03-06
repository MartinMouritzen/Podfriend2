import { IonMenu, IonTitle, IonSearchbar, IonHeader, IonContent, IonIcon, IonLabel, IonList, IonItem, IonToolbar, IonButtons, IonButton, IonRange, IonSegment, IonSegmentButton } from '@ionic/react';

import useStore from 'store/Store';

import { useEffect, useRef, useState } from 'react';

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

import LoadingIcon from 'images/player/loading.png';
import PlayerPodcastCoverArea from './PlayerPodcastCoverArea';


const Player = ({ audioController }) => {
	const audioElement = useRef(null);
	const scrollChild = useRef(null);

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
	const [chaptersLoading,setChaptersLoading] = useState(true);
	const [currentChapter,setCurrentChapter] = useState(false);

	const [subtitleFileURL,setSubtitleFileURL] = useState(false);

	const [error,setError] = useState(false);
	const [errorText,setErrorText] = useState(false);

	const [errorRetries,setErrorRetries] = useState(0);

	const [segmentVisible,setSegmentVisible] = useState('playing');

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
		updateProgress();
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
		var placeInTrack = value * activeEpisode.duration / 100;

		clearTimeout(progressTimeoutId.current);

		// Make sure we don't overload the html5 component
		progressTimeoutId.current = setTimeout(() => {
			setCurrentTime(placeInTrack);
			resetAudioSegmentTime();
	 	},100);
	}

	const generateTimeHash = () => {
		return '#t=' + Math.round(activeEpisode.currentTime ? activeEpisode.currentTime : 0);
	};
	const addUserAgentToUrl = (fileUrl) => {
		if (!fileUrl) { return; }
		try {
			const resourceUrl = new URL(fileUrl);
			resourceUrl.searchParams.delete('_from');
			resourceUrl.searchParams.append('_from','podfriend.com');
			resourceUrl.searchParams.append('_guid',activeEpisode.statsId);
			return resourceUrl.toString();
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
			console.log('Error happened in audio element on ' + new Date());
			console.log(error); console.log(error.nativeEvent);
			console.log(error.nativeEvent.message);
			console.log(error.nativeEvent.code);
			console.log(error.currentTarget);

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
	useEffect(() => {
		audioController.setAudioElement(audioElement.current);
	},[audioElement]);

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
		setSubtitleFileURL(false);

		changeActiveEpisode(activePodcast,activeEpisode);

		retrieveOriginalPodcastFeed(activePodcast)
		.then((feed) => {
			console.log('new original feed in player');
			console.log(feed);
		});
	},[activeEpisode.url]);

	

	

	



	// var playerStyle = { backgroundColor: darkVibrantColor, borderTop: '1px solid ' + darkVibrantColor };
	var playerStyle = {};

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
				className={'player ' + (fullscreen ? 'fullscreen' : 'mini') + ' ' + (shouldPlay ? ' ' + 'playing' : ' ' + 'notPlaying') + (activePodcast ? '' : ' noPodcastPlaying')}
				style={playerStyle}
			>
				{ audioController.useBrowserAudioElement === true &&
					<audio {...audioElementProps}>
						<source src={addUserAgentToUrl(activeEpisode.url) + generateTimeHash()} type={activeEpisode.type ? activeEpisode.type : 'audio/mpeg'} />
					</audio>
				}
				<div className="segmentContainer" style={{ display: (fullscreen ? 'block' : 'none') }}>
					<IonSegment value={segmentVisible} onIonChange={(e) => { setSegmentVisible(e.detail.value); console.log(e.detail.value); }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}>
						<IonSegmentButton value="playing">
							<IonLabel>
								Playing
							</IonLabel>
						</IonSegmentButton>
						<IonSegmentButton value="transcript">
							<IonLabel>Transcript</IonLabel>
						</IonSegmentButton>
					</IonSegment>
				</div>
				{ (!fullscreen || segmentVisible === 'playing') &&
					<div className="playerCoverContainer" onClick={maximize}>
						{ activeEpisode &&
							<PlayerPodcastCoverArea 
								audioController={audioController}
							/>
							
						}
					</div>
				}
				{ (fullscreen && segmentVisible === 'transcript') &&
					<div>
						TRANSCRIPT
					</div>
				}
				<div className="controls">
					<div className='titleAndButtons'>
						{ (!fullscreen || segmentVisible === 'playing') &&
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
									{TimeUtil.formatPrettyDurationText(activeEpisode.currentTime)}
								</div>
								<ProgressBar
									progress={activeEpisode.currentTime}
									duration={activeEpisode.duration}
									onProgressSliderChange={onProgressSliderChange}
								/>
								<div className="durationText" title={TimeUtil.formatPrettyDurationText(activeEpisode.duration - activeEpisode.progress) + ' left.'}>
									{TimeUtil.formatPrettyDurationText(activeEpisode.duration)}
								</div>
							</div>
							<div className="playerControls">
								<div className="button buttonSkipBackward" onClick={onSkipBackward}><SVG src={SkipBackwardIcon} /></div>
								<div className="button buttonRewind" onClick={onBackward}><SVG src={RewindIcon} /></div>
								{ streamDataLoading &&
									<div className="button buttonLoad" onClick={onPauseClicked} style={{ /* backgroundColor: vibrantColor */ }} ><img src={LoadingIcon} /></div>
								}
								{ streamDataLoading === false &&
									<>
									{ shouldPlay &&
										<div className="button buttonPause" onClick={onPauseClicked} style={{ /* backgroundColor: vibrantColor */ }}><SVG src={PauseIcon} /></div>
									}
									{ shouldPlay === false &&
										<div className="button buttonPlay" onClick={onPlayClicked} style={{ /* backgroundColor: vibrantColor */ }}><SVG src={PlayIcon} /></div>
									}
									</>
								}
								<div className="button buttonForward" onClick={onForward}><SVG src={ForwardIcon} /></div>
								<div className="button buttonSkipForward" onClick={onSkipForward}><SVG src={SkipForwardIcon} /></div>
							</div>
						</div>
					</div>
				</div>
				{ fullscreen &&
					<div className="episodeContent">
						{ (!fullscreen || segmentVisible === 'playing') &&
							<EpisodeList podcastPath={activePodcast.path} podcastData={activePodcast} episodes={activePodcast.episodes} />
						}
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