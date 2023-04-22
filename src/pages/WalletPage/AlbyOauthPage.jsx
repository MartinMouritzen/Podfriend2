import Page from "components/Page/Page";

import { useRef, useEffect } from 'react';

import useStore from 'store/Store';

import { useLocation } from 'react-router';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonModal } from "@ionic/react";
import './WalletPage.scss';

const AlbyOauthPage = ({  }) => {
	const _hasHydrated = useStore((state) => state._hasHydrated);
	const userData = useStore((state) => state.userData);

	const exchangeCodeToWalletToken = useStore((state) => state.exchangeCodeToWalletToken);
	const setWalletToken = useStore((state) => state.setWalletToken);

	const location = useLocation();

	useEffect(() => {
		if (_hasHydrated) {
			var searchParams = new URLSearchParams(location.search);
			var code = searchParams.get('code');
			if (code) {
				console.log('We have a code. Let us exchange it to a token');
				exchangeCodeToWalletToken(code)
				.then((token) => {
					setWalletToken(token);
				});
			}
		}
	},[_hasHydrated,location]);

	return (
		<Page id="wallet" title="Alby to Podfriend" showBackButton={false}>
			<div className="walletPageContainer ion-padding">
				<h1>Connection successful</h1>
			</div>
		</Page>
	);
};
export default AlbyOauthPage;