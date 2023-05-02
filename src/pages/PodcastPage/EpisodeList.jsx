import { useEffect, useState, useRef } from 'react';

import { IonList, IonItem, IonLabel, IonSelect,IonSelectOption, IonImg, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonModal, IonContent, IonListHeader, IonSkeletonText, IonRouterLink } from '@ionic/react';

import useStore from 'store/Store';

import './EpisodeList.scss';

import EpisodeItem from './EpisodeItem';

const EpisodeList = ({ podcastData, podcastPath, episodes, showNumberOfEpisodes = 4, inset = false, setActiveEpisodeIsShownInList = false }) => {
	const [sortedEpisodes,setSortedEpisodes] = useState([]);
	const [seasons,setSeasons] = useState([]);
	const [trailers,setTrailers] = useState([]);

	const selectedSeason = useStore((state) => state.podcasts[podcastPath] ? state.podcasts[podcastPath].selectedSeason : undefined);
	const sortOrder = useStore((state) => state.podcasts[podcastPath] ? state.podcasts[podcastPath].sortOrder : undefined);

	const episodeCountShowMoreTrigger = 20;

	const updatePodcastAttributes = useStore((state) => state.updatePodcastAttributes);
	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);
	const shouldPlay = useStore((state) => state.shouldPlay);

	const reorderEpisodes = () => {
		let seasonCount = 0;
		let rawSeasons = [];
		let trailers = [];

		setSeasons([]);
		setTrailers([]);
		setSortedEpisodes([]);

		var shouldUpdateConfig = false;

		let seasonNumbers = false;

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
			seasonNumbers = Object.keys(rawSeasons);
			seasonCount = rawSeasons.length;
			setSeasons(rawSeasons);

			if (!selectedSeason) {
				shouldUpdateConfig = true;
			}
		}
		if (!sortOrder) {
			shouldUpdateConfig = true;
		}
		if (shouldUpdateConfig) {
			updatePodcastAttributes(podcastPath,{
				selectedSeason: selectedSeason ? selectedSeason : seasonNumbers ? seasonNumbers[seasonNumbers.length - 1] : undefined,
				sortOrder: sortOrder ? sortOrder : seasonCount > 1 ? 'old' : 'new'
			});
		}
	};

	useEffect(() => {
		reorderEpisodes();
	},[podcastData.path,podcastData.receivedFromServerText]);

	useEffect(() => {
		if (!seasons[selectedSeason]) {
			return;
		}
		var seasonEpisodes = seasons[selectedSeason].slice();
		setSortedEpisodes(sortOrder === 'new' ? seasonEpisodes : seasonEpisodes.reverse());
	},[seasons,selectedSeason,sortOrder]);

	const onSeasonChange = (event) => {
		console.log(event);
		updatePodcastAttributes(
			podcastData.path,
			{
				selectedSeason: event.detail.value
			}
		);
	};

	const onSortOrderChange = (event) => {
		updatePodcastAttributes(
			podcastPath,
			{
				sortOrder: event.detail.value
			}
		);
	};

	return (
		<div className="episodeListOuter">
			<h2 className="podcastPageSubHeader">Episode list</h2>
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
					selectedText={sortOrder === 'new' ? 'Newest first' : 'Oldest first'}
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


			<IonList lines="full" inset={inset} className="episodeList">
		{ seasons.map((episodes,seasonIndex) => {
			if (selectedSeason == seasonIndex && sortedEpisodes) {
				var foundActiveEpisode = false;
				var shownEpisodes = 0;
				var episodeList = sortedEpisodes.map((episode,episodeIndex) => {
					shownEpisodes++;

					if (sortedEpisodes.length > episodeCountShowMoreTrigger && showNumberOfEpisodes > 0 && shownEpisodes > showNumberOfEpisodes) {
						return;
					}
					if (activeEpisode.guid === episode.guid) {
						foundActiveEpisode = true;
					}

					// var realEpisode = false;
					// Find the "real" episode object.
					/*
					if (podcastData && podcastData.episodes) {
						for (var i=0;i<podcastData.episodes.length;i++) {
							if (podcastData.episodes[i].url == episode.url) {
								episode = podcastData.episodes[i];
							}
						}
					}
					*/
					return <EpisodeItem
						key={episode.guid ? episode.guid : episode.url}
						guid={episode.guid}
						title={episode.title}
						description={episode.description}
						image={episode.image}
						podcastPath={podcastPath}
						podcastData={podcastData}
						episode={episode}
						selected={activeEpisode.guid === episode.guid}
						isActiveEpisode={activeEpisode.guid === episode.guid}
					/>;
				});
				if (setActiveEpisodeIsShownInList) {
					setActiveEpisodeIsShownInList(foundActiveEpisode);
				}
				return episodeList;
			}
		})}
		</IonList>


			{ (sortedEpisodes.length > episodeCountShowMoreTrigger && showNumberOfEpisodes > 0 && showNumberOfEpisodes < sortedEpisodes.length) &&
				<div style={{ padding: '10px', textAlign: 'right' }}>
					<IonButton id="open-episode-modal" fill="clear">Show all episodes ({sortedEpisodes.length})</IonButton>

					<AllEpisodesModal podcastPath={podcastPath} podcastData={podcastData} seasons={seasons} selectedSeason={selectedSeason} sortedEpisodes={sortedEpisodes} activePodcast={activePodcast} activeEpisode={activeEpisode} trigger="open-episode-modal" />
				</div>
			}
		</div>
	);
};
/************************************************
* Actual list of episdoes
************************************************/

/************************************************
* All episodes modal list
************************************************/
const AllEpisodesModal = ({ podcastPath, podcastData, trigger, seasons, selectedSeason, sortedEpisodes, activePodcast, activeEpisode }) => {
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
								const isSelected = activePodcast.url === podcastData.url && activeEpisode.guid == episode.guid;
								return <EpisodeItem
									podcastPath={podcastPath}
									key={episode.guid}
									guid={episode.guid}
									title={episode.title}
									description={episode.description}
									image={episode.image}
									url={episode.url}
									podcastData={podcastData}
									episode={activeEpisode.url === episode.url ? activeEpisode : episode}
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