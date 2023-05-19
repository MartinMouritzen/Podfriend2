import { useEffect, useState, useRef, memo } from 'react';

import useStore from 'store/Store';

import { Link } from 'react-router-dom';

import { format, formatDistance } from 'date-fns';

import AudioPlayingIcon from 'images/icons/audio-playing-light.gif';

import DOMPurify from 'dompurify';

import {
	addCircleOutline as addToPlaylistIcon,
	list as addToPlaylistIcon2,
	play as playIcon,
	play as selectedIcon,
	pause as pauseIcon,
	checkmarkSharp as listenedIcon,
	checkmarkCircle
} from 'ionicons/icons';

import { useIonToast, IonList, IonItem, IonLabel, IonSelect,IonSelectOption, IonImg, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonModal, IonContent, IonListHeader, IonSkeletonText, IonRouterLink, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';

import PodcastImage from 'components/PodcastImage/PodcastImage';
import { current } from 'immer';

/************************************************
* Episode item 
************************************************/
const EpisodeItem = ({ podcastPath, podcastData, episode, guid, id, title, description, image, selected, isActiveEpisode }) => {
	const [episodeTitle,setEpisodeTitle] = useState(title);
	const [episodeDescription,setEpisodeDescription] = useState(description);

	const shouldPlay = useStore((state) => state.shouldPlay);
	const playEpisode = useStore((state) => state.playEpisode);
	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);

	const episodeState = useStore((state) => (state.podcasts && state.podcasts[podcastPath] && state.podcasts[podcastPath].episodes) ? state.podcasts[podcastPath].episodes[guid] : false);
	// console.log(episodeState);

	const addEpisodeToPlaylistStart = useStore((state) => state.addEpisodeToPlaylistStart);
	const addEpisodeToPlaylistEnd = useStore((state) => state.addEpisodeToPlaylistEnd);

	useEffect(() => {
		setEpisodeTitle(DOMPurify.sanitize(title,{
			ALLOWED_TAGS: []
		}));
		setEpisodeDescription(DOMPurify.sanitize(description,{
			ALLOWED_TAGS: ['i','em']
		}));
	},[title, description]);

	const duration = episodeState?.duration ? episodeState.duration : episode.duration;
	const currentTime = episodeState?.currentTime ? episodeState.currentTime : 0;

	var totalMinutes = Math.round(duration / 60);
	var minutesLeft = currentTime ? Math.round((duration - currentTime) / 60) : totalMinutes;
	
	var progressPercentage = currentTime ? (100 * currentTime) / duration : 0;
	if (progressPercentage > 100) {
		progressPercentage = 100;
	}
	else if (isNaN(progressPercentage)) {
		progressPercentage = 0;
	}

	const [ present ] = useIonToast();
	const episodeItemOptionElement = useRef(null);

	const presentAddedToPlaylistToast = (position) => {
		present({
		  message: `<b>Added to ${position} of playlist</b><br /><br />Added &quot;${episode.title}&quot; to playlist`,
		  duration: 1500,
		  position: 'top',
		  cssClass: 'podfriendToast',
		});
	  };

	const onAddEpisodeToPlaylistStart = () => {
		if (episodeItemOptionElement.current) {
			episodeItemOptionElement.current.close();

			addEpisodeToPlaylistStart();
			presentAddedToPlaylistToast('start');
		}
	};
	const onAddEpisodeToPlaylistEnd = () => {
		if (episodeItemOptionElement.current) {
			episodeItemOptionElement.current.close();
			addEpisodeToPlaylistEnd();
			presentAddedToPlaylistToast('end');
		}
	};

	const onPlay = () => {
		if (isActiveEpisode) {
			console.log('---------------- is active episode ----------------');
			audioPlay();
		}
		else {
			console.log('---------------- changing episode ----------------');
			console.log(podcastData);
			playEpisode(podcastData.path,podcastData,guid);
		}
	};
	const onPause = () => {
		audioPause();
	};
	// console.log(episodeState);

	return (
		<IonItemSliding ref={episodeItemOptionElement} disabled={true}>
			<IonItem
				key={id}
	//			onClick={() => { onEpisodeSelect(episode); }}
				className={'episode' + (selected ? ' selected' : '') + (episodeState?.listened ? ' listened' : '')}
			>
				<div>
					<PodcastImage
						podcastPath={podcastData.path}
						width={120}
						height={120}
						coverWidth={60}
						coverHeight={60}
						imageErrorText={title}
						src={image ? image : podcastData.artworkUrl600 ? podcastData.artworkUrl600 : podcastData.image}
						fallBackImage={podcastData.artworkUrl600}
						className={'cover'}
						asBackground={true}
						loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
					/>
					{ episodeState?.listened &&
						<div className="listenedMarker"><IonIcon icon={listenedIcon} /></div>
					}
				</div>
				<IonLabel className="ion-text-wrap">
					<Link
						to={{
							pathname: `/podcast/${podcastData.path}/episode/${encodeURIComponent(guid)}/`,
							state: {
								podcast: podcastData,
								episode: episode
							}
						}}
						key={episode.guid}
					>
						<p className="date">
							{format(episode.date ? new Date(episode.date) : new Date(),'MMM d, yyyy')}
							{ episode.date &&
								<span className='agoText'>({formatDistance(new Date(episode.date), new Date())} ago)</span>
							}
							{ episodeState?.listened &&
								<span className="listenedLabel"><IonIcon icon={checkmarkCircle} /> Listened</span>
							}
						</p>
						<h2>
							{ selected && 
								<div style={{ display: 'inline-block', height: 17, width: 20 }}>
									{ (selected && shouldPlay) &&
										<div style={{ display: 'inline-block',  }}>
											<img src={AudioPlayingIcon} style={{ height: 17, marginRight: 9, position: 'relative', top: 2 }} /> 
										</div>
									}
									{ (selected && !shouldPlay) &&
										<div style={{ display: 'inline-block' }}>
											<IonIcon icon={selectedIcon} style={{ marginRight: '9px', pointerEvents: 'none', position: 'relative', top: 2 }} />
										</div>
									}
								</div>
							}
							{ episodeTitle }</h2>
						<p className="description" dangerouslySetInnerHTML={{__html:episodeDescription}}></p>
					</Link>
					<div className="playAndProgress">
						<div>
							{ ((!isActiveEpisode || !shouldPlay)) &&
								<div className="playButton" onClick={(event) => { onPlay(episode); return false; }}><IonIcon icon={playIcon} /></div>
							}
							{ (shouldPlay && isActiveEpisode) &&
								<div className="pauseButton" onClick={(event) => { onPause(episode); return false;  }}><IonIcon icon={pauseIcon} /></div>
							}
						</div>
						{ ("live" in episode !== true) &&
							<div className="progress">
								{ (!isNaN(minutesLeft) && progressPercentage > 0) &&
									<div className="episodeProgressBarOuter">
										<div className="episodeProgressBarInner" style={{ width: Math.round(progressPercentage) + '%' }}/>
									</div>
								}

								{ (!isNaN(minutesLeft) && minutesLeft == totalMinutes) && 
									<span>{totalMinutes} min</span>
								}
								{ (!isNaN(minutesLeft) && minutesLeft != totalMinutes) && 
									<span>{Math.round((duration - currentTime) / 60)} of {totalMinutes} min left</span>
								}
								{ isNaN(minutesLeft) &&
									<span>{currentTime} - {duration}</span>
								}
							</div>
						}
					</div>
				</IonLabel>
			</IonItem>
			<IonItemOptions onIonSwipe={onAddEpisodeToPlaylistStart} side="start">
				<IonItemOption expandable onClick={onAddEpisodeToPlaylistStart}>Add to start of Playlist</IonItemOption>
			</IonItemOptions>
			<IonItemOptions onIonSwipe={onAddEpisodeToPlaylistEnd} side="end">
				<IonItemOption expandable onClick={onAddEpisodeToPlaylistEnd}>Add to end of Playlist</IonItemOption>
			</IonItemOptions>
		</IonItemSliding>
	);
}
/*
function episodeShouldCache(prevEpisode,nextEpisode) {
	if (nextEpisode.isActiveEpisode) { return false; }
	if (prevEpisode.isActiveEpisode) { return false; }
	if (nextEpisode.location != prevEpisode.location) { return false; }
	if (nextEpisode.title != prevEpisode.title) { return false; }
	if (nextEpisode.description != prevEpisode.description) { return false; }
	if (nextEpisode.url != prevEpisode.url) { return false; }
	if (nextEpisode.currentTime != prevEpisode.currentTime) { return false; }
	if (nextEpisode.duration != prevEpisode.duration) { return false; }
	if (nextEpisode.listened != prevEpisode.listened) { return false; }
	if (nextEpisode.isActiveEpisode != prevEpisode.isActiveEpisode) { return false; }
	// if (nextEpisode.hideListenedEpisodes != prevEpisode.hideListenedEpisodes) { return false; }
	// if (prevEpisode.isActiveEpisode && nextEpisode.shouldPlay != prevEpisode.shouldPlay) { return false; }
	if (nextEpisode.episodeImage != prevEpisode.episodeImage) { return false; }
	
	return true;
}

export default memo(EpisodeItem, episodeShouldCache);
*/
export default EpisodeItem;