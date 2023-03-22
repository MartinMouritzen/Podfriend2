import { useEffect, useState, useRef } from 'react';

import { IonList, IonItem, IonLabel, IonSelect,IonSelectOption, IonImg, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonModal, IonContent, IonListHeader, IonSkeletonText, IonRouterLink } from '@ionic/react';

import useStore from 'store/Store';

import './EpisodeList.scss';

import EpisodeItem from './EpisodeItem';

const EpisodeList = ({ podcastData, podcastPath, episodes, showNumberOfEpisodes = 4, inset = false }) => {
	const [selectedSeason,setSelectedSeason] = useState(0);
	const [selectedSortOrder,setSelectedSortOrder] = useState('new');
	const [sortedEpisodes,setSortedEpisodes] = useState([]);
	const [seasons,setSeasons] = useState([]);
	const [trailers,setTrailers] = useState([]);

	const episodeCountShowMoreTrigger = 20;

	const updatePodcastConfig = useStore((state) => state.updatePodcastConfig);
	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	/*
	if (activePodcast.path == podcastData.path) {
		podcastData = activePodcast;
	}
	*/

	useEffect(() => {
		console.log(podcastData);
		console.log(podcastData.receivedFromServer);

		let seasonCount = 0;
		let rawSeasons = [];
		let trailers = [];

		setSeasons([]);
		setTrailers([]);
		setSortedEpisodes([]);

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
			console.log(`setSelectedSeason: ${podcastData.configSelectedSeason ? podcastData.configSelectedSeason : seasonNumbers[seasonNumbers.length - 1]}`);
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
	},[podcastData.path,podcastData.receivedFromServerText]);

	useEffect(() => {
		if (!seasons[selectedSeason]) {
			return;
		}
		var seasonEpisodes = seasons[selectedSeason].slice();
		setSortedEpisodes(selectedSortOrder === 'new' ? seasonEpisodes : seasonEpisodes.reverse());
	},[seasons,selectedSeason,selectedSortOrder]);

	const onSeasonChange = (event) => {
		console.log(event);
		updatePodcastConfig({
			guid: podcastData.guid,
			podcastPath: podcastData.path,
			season: event.detail.value
		});
		console.log(event.detail.value);
		console.trace();
		setSelectedSeason(event.detail.value);
	};

	const onSortOrderChange = (event) => {
		updatePodcastConfig({
			guid: podcastData.guid,
			podcastPath: podcastData.path,
			sortOrder: event.detail.value
		});
		console.log(event.detail.value);
		setSelectedSortOrder(event.detail.value);
	};

	return (
		<div className="episodeListOuter">
			<h1>Episode list</h1>
			<div className="episodeListActions">
				{ seasons.length > 1 &&
					<IonSelect
						className="seasonSelect"
						interface="action-sheet"
						selectedText={selectedSeason === 0 ? "Bonus material" : "Season " + selectedSeason}
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
			<EpisodeListInner episodeCountShowMoreTrigger={episodeCountShowMoreTrigger} showNumberOfEpisodes={showNumberOfEpisodes} podcastData={podcastData} seasons={seasons} selectedSeason={selectedSeason} sortedEpisodes={sortedEpisodes} activePodcast={activePodcast} activeEpisode={activeEpisode} inset={inset} />
			{ (sortedEpisodes.length > episodeCountShowMoreTrigger && showNumberOfEpisodes > 0 && showNumberOfEpisodes < sortedEpisodes.length) &&
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
const EpisodeListInner = ({ podcastData, seasons, selectedSeason, sortedEpisodes, showNumberOfEpisodes, episodeCountShowMoreTrigger, inset = false }) => {
	// const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);
	const shouldPlay = useStore((state) => state.shouldPlay);

	return (
		<IonList lines="full" inset={inset} className="episodeList">
		{ seasons.map((episodes,seasonIndex) => {
			if (selectedSeason == seasonIndex && sortedEpisodes) {
				var shownEpisodes = 0;
				return sortedEpisodes.map((episode,episodeIndex) => {
					shownEpisodes++;

					if (sortedEpisodes.length > episodeCountShowMoreTrigger && showNumberOfEpisodes > 0 && shownEpisodes > showNumberOfEpisodes) {
						return;
					}

					// var realEpisode = false;
					// Find the "real" episode object.
					if (podcastData && podcastData.episodes) {
						for (var i=0;i<podcastData.episodes.length;i++) {
							if (podcastData.episodes[i].url == episode.url) {
								episode = podcastData.episodes[i];
							}
						}
					}

					return <EpisodeItem
						key={episode.guid ? episode.guid : episode.url}
						id={episode.id}
						guid={episode.guid}
						title={episode.title}
						description={episode.description}
						image={episode.image}
						currentTime={episode.currentTime}
						duration={episode.duration}
						url={episode.url}
						podcastData={podcastData}
						episode={activeEpisode.url === episode.url ? activeEpisode : episode}
						shouldPlay={shouldPlay}
						selected={activeEpisode.url === episode.url}
						isActiveEpisode={activeEpisode.url === episode.url}
					/>;
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
	const shouldPlay = useStore((state) => state.shouldPlay);
	
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
					<IonTitle>{podcastData.name} episodes</IonTitle>
					<IonButtons slot="end">
						<IonButton onClick={() => dismiss()}>Close</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="greyPage">
				<IonList inset={true} className="episodeList">
					<IonListHeader>Episodes for {podcastData.name}</IonListHeader>
					{ seasons.map((episodes,seasonIndex) => {
						if (selectedSeason == seasonIndex && sortedEpisodes) {
							return sortedEpisodes.map((episode,episodeIndex) => {
								const isSelected = activePodcast.url === podcastData.url && activeEpisode.id == episode.id;
								return <EpisodeItem
									key={episode.guid ? episode.guid : episode.url}
									id={episode.id}
									guid={episode.guid}
									title={episode.title}
									description={episode.description}
									image={episode.image}
									currentTime={episode.currentTime}
									duration={episode.duration}
									url={episode.url}
									podcastData={podcastData}
									episode={activeEpisode.url === episode.url ? activeEpisode : episode}
									shouldPlay={shouldPlay}
									selected={activeEpisode.url === episode.url}
									isActiveEpisode={activeEpisode.url === episode.url}
								/>;
							})
						}
					})}
				</IonList>
			</IonContent>
		</IonModal>
	);
};

export default EpisodeList;