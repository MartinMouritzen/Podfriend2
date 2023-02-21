import { useEffect, useState, useRef } from 'react';

import { IonList, IonItem, IonLabel, IonSelect,IonSelectOption, IonImg, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonModal, IonContent, IonListHeader, IonSkeletonText } from '@ionic/react';

import {
	timeOutline as timeIcon
} from 'ionicons/icons';

import { format, formatDistance } from 'date-fns';

import useStore from 'store/Store';

import './EpisodeList.scss';
import PodcastImage from 'components/PodcastImage/PodcastImage';

import DOMPurify from 'dompurify';

const EpisodeList = ({ podcastData, podcastPath, episodes, showNumberOfEpisodes = 6, inset = false }) => {
	const [selectedSeason,setSelectedSeason] = useState(0);
	const [selectedSortOrder,setSelectedSortOrder] = useState('new');
	const [sortedEpisodes,setSortedEpisodes] = useState([]);
	const [seasons,setSeasons] = useState([]);
	const [trailers,setTrailers] = useState([]);

	const updatePodcastConfig = useStore((state) => state.updatePodcastConfig);
	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	useEffect(() => {
		let seasonCount = 0;
		let rawSeasons = [];
		let trailers = [];

		if (Array.isArray(episodes)) {
			episodes.forEach((episode,index) => {
				var seasonNumber = 0;

				var episodeSeason = parseInt(episode.season);

				if (episode.episodeType === 'trailer') {
					trailers.push(episode);
				}
				else {
					if (Number.isInteger(episodeSeason)) {
						seasonNumber = episodeSeason;
					}
					if (!Array.isArray(rawSeasons[seasonNumber])) {
						rawSeasons[seasonNumber] = [];
					}
					rawSeasons[seasonNumber].push(episode);
				}
			});
			let seasonNumbers = Object.keys(rawSeasons);
			seasonCount = rawSeasons.length;
			setSeasons(rawSeasons);
			setSelectedSeason(podcastData.configSelectedSeason ? podcastData.configSelectedSeason : seasonNumbers[seasonNumbers.length - 1]);
			console.log('setSelectedSeason: ' + podcastData.configSelectedSeason ? podcastData.configSelectedSeason : seasonNumbers[seasonNumbers.length - 1]);
		}
		
		if (podcastData.configSelectedSortOrder) {
			console.log('selected order: ' + podcastData.configSelectedSortOrder);
			setSelectedSortOrder(podcastData.configSelectedSortOrder);
		}
		else {
			// If it's a seasonal podcast, we want to sort old to new
			if (seasonCount > 1) {
				console.log('oef1');
				setSelectedSortOrder('old');
			}
			else {
				console.log('oef2');
				setSelectedSortOrder('new');
			}
		}
	},[episodes]);

	useEffect(() => {
		if (!seasons[selectedSeason]) {
			return;
		}
		var seasonEpisodes = seasons[selectedSeason].slice();
		setSortedEpisodes(selectedSortOrder === 'new' ? seasonEpisodes : seasonEpisodes.reverse());
	},[seasons,selectedSeason,selectedSortOrder]);

	const onSeasonChange = (event) => {
		updatePodcastConfig({
			guid: podcastData.guid,
			podcastPath: podcastData.path,
			season: event.detail.value
		});
		setSelectedSeason(event.detail.value);
	};

	const onSortOrderChange = (event) => {
		updatePodcastConfig({
			guid: podcastData.guid,
			podcastPath: podcastData.path,
			sortOrder: event.detail.value
		});
		setSelectedSortOrder(event.detail.value);
	};

	return (
		<div>
			<div className="episodeListActions">
				{ seasons.length > 1 &&
					<IonSelect
						className="seasonSelect"
						interface="action-sheet"
						selectedText={"Season " + selectedSeason}
						value={selectedSeason}
						onIonChange={onSeasonChange}
					>
						<IonItem>
							{ seasons.map((episodes,seasonIndex) => {
								if (seasonIndex === 0) {
									return (
										<IonSelectOption value={seasonIndex} key={seasonIndex}>Bonus material</IonSelectOption>
									);
								}
								else {
									return (
										<IonSelectOption value={seasonIndex} key={seasonIndex}>Season {seasonIndex}</IonSelectOption>
									);
								}
							})}
						</IonItem>
					</IonSelect>
				}
				<IonSelect
					className="sortOrderSelect"
					interface="action-sheet"
					selectedText={selectedSortOrder === 'new' ? 'Newest first' : 'Oldest first'}
					onIonChange={onSortOrderChange}
				>
					<IonItem>
						<IonSelectOption value={'new'} key={'new'}>Newest first</IonSelectOption>
					</IonItem>
					<IonItem>
						<IonSelectOption value={'old'} key={'old'}>Oldest first</IonSelectOption>
					</IonItem>
				</IonSelect>
			</div>
			<EpisodeListInner showNumberOfEpisodes={showNumberOfEpisodes} podcastData={podcastData} seasons={seasons} selectedSeason={selectedSeason} sortedEpisodes={sortedEpisodes} activePodcast={activePodcast} activeEpisode={activeEpisode} inset={inset} />
			{ (showNumberOfEpisodes > 0 && showNumberOfEpisodes < sortedEpisodes.length) &&
				<div style={{ padding: '10px', textAlign: 'right' }}>
					<IonButton id="open-episode-modal" fill="clear">Show all episodes ({sortedEpisodes.length})</IonButton>

					<AllEpisodesModal podcastData={podcastData} seasons={seasons} selectedSeason={selectedSeason} sortedEpisodes={sortedEpisodes} activePodcast={activePodcast} activeEpisode={activeEpisode} trigger="open-episode-modal" />
				</div>
			}
		</div>
	);
};
/************************************************
* Actual list of episdoes
************************************************/
const EpisodeListInner = ({ podcastData, seasons, selectedSeason, sortedEpisodes, showNumberOfEpisodes, inset = false }) => {
	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	return (
		<IonList lines="full" inset={inset}>
		{ seasons.map((episodes,seasonIndex) => {
			if (selectedSeason == seasonIndex && sortedEpisodes) {
				var shownEpisodes = 0;
				return sortedEpisodes.map((episode,episodeIndex) => {
					shownEpisodes++;

					if (showNumberOfEpisodes > 0 && shownEpisodes > showNumberOfEpisodes) {
						return;
					}
					const isSelected = activePodcast.url === podcastData.url && activeEpisode.id == episode.id;

					return <EpisodeItem key={episode.url} podcastData={podcastData} episode={episode} selected={isSelected} activeEpisode={activeEpisode} />
				})
			}
		})}
		</IonList>
	);
}
/************************************************
* All episodes modal list
************************************************/
const AllEpisodesModal = ({ podcastData, trigger, seasons, selectedSeason, sortedEpisodes, activePodcast, activeEpisode }) => {
	const page = useRef(null);
	const modal = useRef(null);
	const [presentingElement, setPresentingElement] = useState(null);
	
	useEffect(() => {
		setPresentingElement(page.current);
	}, []);

	const dismiss = () => {
		modal.current?.dismiss();
	}
	const onDismiss = () => {

	}

	return (
		<IonModal ref={modal} trigger={trigger} presentingElement={presentingElement} canDismiss={true} onDidDismiss={onDismiss}>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Episodes</IonTitle>
					<IonButtons slot="end">
						<IonButton onClick={() => dismiss()}>Close</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="greyPage">
				<IonList inset={true}>
					<IonListHeader>Episodes for {podcastData.name}</IonListHeader>
					{ seasons.map((episodes,seasonIndex) => {
						if (selectedSeason == seasonIndex && sortedEpisodes) {
							return sortedEpisodes.map((episode,episodeIndex) => {
								const isSelected = activePodcast.url === podcastData.url && activeEpisode.id == episode.id;
								return <EpisodeItem podcastData={podcastData} episode={episode} selected={isSelected} />
							})
						}
					})}
				</IonList>
			</IonContent>
		</IonModal>

	);
};
/************************************************
* Episode item 
************************************************/
const EpisodeItem = ({ podcastData, episode, selected, activeEpisode }) => {
	const [episodeTitle,setEpisodeTitle] = useState(episode.title);
	const [episodeDescription,setEpisodeDescription] = useState(episode.description);

	const playEpisode = useStore((state) => state.playEpisode);

	useEffect(() => {
		setEpisodeTitle(DOMPurify.sanitize(episode.title,{
			ALLOWED_TAGS: []
		}));
		setEpisodeDescription(DOMPurify.sanitize(episode.description,{
			ALLOWED_TAGS: ['i','em']
		}));
	},[episode.title, episode.description]);

	var totalMinutes = Math.round(episode.duration / 60);
	var minutesLeft = episode.currentTime ? Math.round((episode.duration - episode.currentTime) / 60) : totalMinutes;
	
	var progressPercentage = episode.currentTime ? (100 * episode.currentTime) / episode.duration : 0;
	if (progressPercentage > 100) {
		progressPercentage = 100;
	}

	const onEpisodeSelect = (episode) => {
		playEpisode(podcastData,episode.url);
	};

	// var realEpisode = false;
	// Find the "real" episode object.
	if (podcastData && podcastData.episodes) {
		for (var i=0;i<podcastData.episodes.length;i++) {
			if (podcastData.episodes[i].url == episode.url) {
				episode = podcastData.episodes[i];
			}
		}
	}

	return (
		<IonItem
			key={episode.id}
			onClick={() => { onEpisodeSelect(episode); }}
			className={'episode' + (selected ? ' selected' : '')}
		>
			<PodcastImage
				podcastPath={podcastData.path}
				width={120}
				height={120}
				coverWidth={60}
				coverHeight={60}
				imageErrorText={episode.title}
				src={episode.image ? episode.image : podcastData.artworkUrl600 ? podcastData.artworkUrl600 : podcastData.image}
				fallBackImage={podcastData.artworkUrl600}
				className={'cover'}
				asBackground={true}
				loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
			/>
			<IonLabel>
				<p className="date">
					{format(episode.date ? new Date(episode.date) : new Date(),'MMM d, yyyy')}
					<span className='agoText'>({formatDistance(new Date(episode.date), new Date())} ago)</span>
				</p>
				<h2>{ episodeTitle }</h2>
				<p>{episodeDescription}</p>
				<p>
					<IonIcon icon={timeIcon} style={{ marginRight: '5px', position: 'relative', top: '2px' }}/> 
					{ minutesLeft == totalMinutes && 
						<span>{totalMinutes} minutes</span>
					}
					{ minutesLeft != totalMinutes && 
						<span>{Math.round((episode.duration - episode.currentTime) / 60)} of {totalMinutes} minutes left</span>
					}
					- { episode.url === activeEpisode.url ? activeEpisode.currentTime : episode.currentTime}
				</p>
			</IonLabel>
		</IonItem>
	);
}

export default EpisodeList;