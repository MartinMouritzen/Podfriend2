import { useEffect, useState } from 'react';

import Page from "components/Page/Page";

import useStore from 'store/Store';

import PodcastList from 'components/Lists/PodcastList';

import sortIcon from 'images/icons/sort.svg';

import { IonSearchbar, IonToolbar, IonHeader, IonTitle, IonButtons, IonButton, IonIcon, useIonActionSheet	} from '@ionic/react';

const FavoritePage = () => {
	const [present] = useIonActionSheet();

	const loggedIn = useStore((state) => state.loggedIn);
	const synchronizePodcasts = useStore((state) => state.synchronizePodcasts);

	const getFollowedPodcastList = useStore((state) => state.getFollowedPodcastList);

	const favoriteSortOrder = useStore((state) => state.favoriteSortOrder);
	const setFavoriteSortOrder = useStore((state) => state.setFavoriteSortOrder);

	const followedPodcastGuids = useStore((state) => state.followedPodcasts);
	const [orderedFollowedPodcasts,setOrderedFollowedPodcasts] = useState(false);

	const [filterString,setFilterString] = useState('');

	const onFilterChange = (event) => {
		setFilterString(event.detail.value);
	}

	const sortFavoritePodcasts = () => {
		var followedPodcasts = getFollowedPodcastList();

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
		else if (favoriteSortOrder === 'latestListened') {
			var sortByLatestListened= followedPodcasts.slice().sort((a, b) => {
				if (!a.lastListened && !b.lastListened) { return 0; }
				if (a.lastListened && !b.lastListened) { return -1; }
				if (!a.lastListened && b.lastListened) { return 1; }
				return new Date(b.lastListened) - new Date(a.lastListened);
			});
			setOrderedFollowedPodcasts(sortByLatestListened);
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
	},[JSON.stringify(followedPodcastGuids),favoriteSortOrder]);

	const onRefreshFavorites = (event) => {
		if (!loggedIn) {
			// Show toast that user is not logged in, so can't sync favorites
			if (event && event.detail && event.detail.complete) {
				event.detail.complete();
			}
			return;
		}
		var startTime = new Date();

		synchronizePodcasts()
		.then(() => {
			var endTime = new Date();
			var timeDifference = endTime - startTime;
			
			var minimumTimeToDisplayLoading = 1500;
			var remainingTime = 0;
			
			if (timeDifference < minimumTimeToDisplayLoading) {
				remainingTime = minimumTimeToDisplayLoading - timeDifference;
			}
			setTimeout(() => {
				if (event && event.detail && event.detail.complete) {
					event.detail.complete();
				}
			},remainingTime);
		});
	};	

	const showFavoriteSortMenu = () => {
		present({
			header: 'Order favorites',
			buttons: [
				{
					text: 'Latest listened on top',
					role: favoriteSortOrder === 'latestListened' ? 'selected' : '',
					data: {
						action: 'latestListened',
					},
				},
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
		<Page title="Favorites" defaultHeader={false} showBackButton={false} onRefresh={onRefreshFavorites}>
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
					<h2>
						Favorite podcasts sorted by&nbsp;
							{favoriteSortOrder === 'alphabetical_az' ? 'alphabetical order'
							: favoriteSortOrder === 'latestListened' ? 'latest listened' : favoriteSortOrder}
					</h2>
				</div>
				<PodcastList backButtonText="Favorites" podcasts={orderedFollowedPodcasts} listType='grid' filterString={filterString} />
			</div>
		</Page>
	);
};
export default FavoritePage;