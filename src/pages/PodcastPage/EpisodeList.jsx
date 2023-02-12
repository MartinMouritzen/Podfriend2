import { useEffect, useState } from 'react';

import { IonList, IonItem, IonLabel, IonSelect,IonSelectOption } from '@ionic/react';

import useStore from 'store/Store';

import './EpisodeList.scss';

const EpisodeList = ({ podcastData, podcastPath, episodes }) => {
	const [selectedSeason,setSelectedSeason] = useState(0);
	const [selectedSortOrder,setSelectedSortOrder] = useState('new');
	const [sortedEpisodes,setSortedEpisodes] = useState([]);
	const [seasons,setSeasons] = useState([]);
	const [trailers,setTrailers] = useState([]);

	const updatePodcastConfig = useStore((state) => state.updatePodcastConfig);
	const playEpisode = useStore((state) => state.playEpisode);
	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);
	
	useEffect(() => {
		let seasonCount = 0;
		let rawSeasons = [];
		let trailers = [];

		console.log(podcastData);

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
		console.log(podcastData);
		
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

	const onEpisodeSelect = (episode) => {
		console.log('Episode selected');
		console.log(episode);

		playEpisode(podcastData,episode);
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
			<IonList lines="full">
			{ seasons.map((episodes,seasonIndex) => {
				if (selectedSeason == seasonIndex && sortedEpisodes) {
					return sortedEpisodes.map((episode,episodeIndex) => {
						const isSelected = activePodcast.url === podcastData.url && activeEpisode.id == episode.id;
						return (
							<IonItem key={episode.id} onClick={() => { onEpisodeSelect(episode); }} className={'episode' + (isSelected ? ' selected' : '')}>
								<IonLabel>
									{ episode.title }
								</IonLabel>
							</IonItem>
						);
					})
				}
			})}
			</IonList>
			<h2>
				Trailers
			</h2>
		</div>
	);
};
export default EpisodeList;