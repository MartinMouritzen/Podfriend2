import Page from "components/Page/Page";

import { useRef } from 'react';

import useStore from 'store/Store';

import CreditCard from "components/Wallet/CreditCard";

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon
} from 'ionicons/icons';

import './WalletPage.scss';

const WalletPage = ({  }) => {
	const userData = useStore((state) => state.userData);

	// console.log(userData);

	return (
		<Page id="wallet" title="Wallet" className="greyPage" showBackButton={false}>
			<div className="walletPageContainer">
				<div className="creditCardContainer">
					<CreditCard walletBalance={10} username={userData?.username} />
				</div>
				<div className="mobileFriendlyContainer">
					<IonList lines="full" inset={true} >
						<IonListHeader>
							<IonLabel>Your podcast wallet</IonLabel>
						</IonListHeader>

						<IonItem detail={true}>
							<IonIcon icon={fundsIcon} slot="start" />
							Add funds
						</IonItem>
						<IonItem detail={true}>
						<IonIcon icon={historyIcon} slot="start" />
							Boost and Stream history
						</IonItem>
						<IonItem detail={true}>
							<IonIcon icon={turnOffIcon} slot="start" />
							Turn off the Podcast Wallet
						</IonItem>
					</IonList>
				</div>
			</div>
		</Page>
	);
};
export default WalletPage;