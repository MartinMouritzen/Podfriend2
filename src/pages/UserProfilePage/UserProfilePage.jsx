import Page from "components/Page/Page";

import { useRef, useEffect, useState } from 'react';

import useStore from 'store/Store';

import PodfriendLogo from 'images/icons/podfriend_logo.svg';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonSegment, IonSegmentButton, IonTitle, IonToolbar, useIonModal } from "@ionic/react";

import {
	walletOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon,
	checkmarkCircle as settledIcon,
	helpCircleOutline as helpIcon,
	alertCircleOutline as noticeIcon
} from 'ionicons/icons';
import Avatar from "components/UI/Avatar/Avatar";

const UserProfilePage = ({ match }) => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);
	console.log(userData);

	const userName = match.params.userName;

	const refreshUserProfile = (event) => {
		if (event && event.detail && event.detail.complete) {
			event.detail.complete();
		}
	}

	useEffect(() => {
		refreshUserProfile();
	},[userName]);

	return (
		<Page id="wallet" title="User Profile" className="greyPage" onRefresh={refreshUserProfile} defaultHeader={false}>
			<div>
				<Avatar width={200} height={200} src={PodfriendLogo} userName={userData.userName} userGuid={userData.guid} />
			</div>
		
		</Page>
	);
};
export default UserProfilePage;