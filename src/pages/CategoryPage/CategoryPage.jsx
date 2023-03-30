import Page from "components/Page/Page";

import { useRef } from 'react';

import useStore from 'store/Store';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon
} from 'ionicons/icons';

import './CategoryPage.scss';

const CategoryPage = ({ match }) => {
	const categoryId = match.params.categoryId;

	return (
		<Page id="categoryPage" title="Category" className="greyPage" showBackButton={true}>
			Category
		</Page>
	);
};
export default CategoryPage;