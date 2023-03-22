import { useEffect, useState } from 'react';

import Page from "components/Page/Page";

import useStore from 'store/Store';

import PodcastList from 'components/Lists/PodcastList';

import sortIcon from 'images/icons/sort.svg';

import { IonSearchbar, IonToolbar, IonHeader, IonTitle, IonButtons, IonButton, IonIcon, useIonActionSheet	} from '@ionic/react';

const FavoritePage = () => {
	const [present] = useIonActionSheet();

	const favoriteSortOrder = useStore((state) => state.favoriteSortOrder);
	const setFavoriteSortOrder = useStore((state) => state.setFavoriteSortOrder);

	const followedPodcasts = useStore((state) => state.followedPodcasts);
	const [orderedFollowedPodcasts,setOrderedFollowedPodcasts] = useState(followedPodcasts);

	const [filterString,setFilterString] = useState('');

	const onFilterChange = (event) => {
		setFilterString(event.detail.value);
	}

	const sortFavoritePodcasts = () => {
		if (favoriteSortOrder === 'latest') {
			var sortByLatest = followedPodcasts.slice().sort((a, b) => {
				return new Date(b.dateFollowed) - new Date(a.dateFollowed);
			});
			setOrderedFollowedPodcasts(sortByLatest);
		}
		else if (favoriteSortOrder === 'oldest') {
			var sortByOldest= followedPodcasts.slice().sort((a, b) => {
				return new Date(a.dateFollowed) - new Date(b.dateFollowed);
			});
			setOrderedFollowedPodcasts(sortByOldest);
		}
		else {
			var sortByName = followedPodcasts.slice().sort((a, b) => {
				return a.name.localeCompare(b.name);
			});
			setOrderedFollowedPodcasts(sortByName);
		}
	};

	useEffect(() => {
		console.log('change sorting order');
		sortFavoritePodcasts();
	},[followedPodcasts.length,favoriteSortOrder]);
	

	const showFavoriteSortMenu = () => {
		present({
			header: 'Order favorites',
			buttons: [
				{
					text: 'Latest added on top',
					role: favoriteSortOrder === 'latest' ? 'selected' : '',
					data: {
						action: 'latest',
					},
				},
				{
					text: 'Oldest added on top',
					role: favoriteSortOrder === 'oldest' ? 'selected' : '',
					data: {
						action: 'oldest',
					},
				},
				{
					text: 'Alphabetical',
					role: favoriteSortOrder === 'alphabetical_az' ? 'selected' : '',
					data: {
						action: 'alphabetical_az',
					},
				},
				{
					text: 'Cancel',
					role: 'cancel',
					data: {
						action: 'cancel',
					},
				},
			],
			onWillDismiss: ({ detail }) => {
				if (detail && detail.data && detail.data.action !== 'cancel') {
					setFavoriteSortOrder(detail.data.action);
				}
			},
		})
	}

	return (
		<Page title="Favorites" defaultHeader={false} showBackButton={false}>
			<IonHeader collapse="condense" class="mainTitleHeader">
				<IonToolbar>
					<IonTitle size="large">Favorites</IonTitle>
					<IonButtons slot="primary" style={{ paddingRight: '12px' }}>
						<IonButton fill="solid" onClick={showFavoriteSortMenu}><IonIcon src={sortIcon} /></IonButton>
					</IonButtons>
				</IonToolbar>
				<IonToolbar>
					<IonSearchbar collapse={true} animated={true} show-clear-button="focus" inputmode="search" placeholder="Search favorites" onIonChange={onFilterChange}></IonSearchbar>
				</IonToolbar>
			</IonHeader>
			<div style={{ paddingLeft: '7px', paddingRight: '7px' }}>
				<div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
					<h2>Favorite podcasts sorted by {favoriteSortOrder === 'alphabetical_az' ? 'alphabetical order' : favoriteSortOrder}</h2>
				</div>
				<PodcastList backButtonText="Favorites" podcasts={orderedFollowedPodcasts} listType='grid' filterString={filterString} />
			</div>
		</Page>
	);
};
export default FavoritePage;