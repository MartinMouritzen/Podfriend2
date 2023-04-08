import Page from "components/Page/Page";

import { useState, useEffect } from 'react';

import useStore from 'store/Store';

import categories from 'constants/categories';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon
} from 'ionicons/icons';

import PodcastList from "components/Lists/PodcastList";

import './CategoryPage.scss';

const CategoryPage = ({ match }) => {
	const categoryKey = match.params.categoryKey;
	const category = categories[categoryKey];

	const [podcasts,setPodcasts] = useState(false);

	const __retrieveTrendingPodcasts = useStore((state) => state.__retrieveTrendingPodcasts);

	useEffect(() => {
		setPodcasts(false);
		if (categoryKey) {
			__retrieveTrendingPodcasts(category.id,18)
			.then((podcasts) => {
				setPodcasts(podcasts);
			});
		}
	},[categoryKey]);

	return (
		<Page id="categoryPage" title={'Category: ' + category.name} className="" showBackButton={true}>
			<PodcastList backButtonText={category.name} podcasts={podcasts} listType='grid' displayLoadingCovers="18" />
		</Page>
	);
};
export default CategoryPage;