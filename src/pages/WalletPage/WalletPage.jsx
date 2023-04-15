import Page from "components/Page/Page";

import { useRef, useEffect } from 'react';

import useStore from 'store/Store';

import CreditCard from "components/Wallet/CreditCard";

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonModal } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon,
	helpCircleOutline as helpIcon
} from 'ionicons/icons';

import { Browser } from '@capacitor/browser';

import './WalletPage.scss';
import WalletModal from "components/Wallet/WalletModal";

const WalletPage = ({  }) => {
	const _hasHydrated = useStore((state) => state._hasHydrated);
	const userData = useStore((state) => state.userData);
	const walletBalance = useStore((state) => state.walletBalance);
	const walletSetupCompleted = useStore((state) => state.walletSetupCompleted);
	const walletOnboardingShowed = useStore((state) => state.walletOnboardingShowed);
	const updateWalletOnboardingShowed = useStore((state) => state.updateWalletOnboardingShowed);

	// console.log(userData);

	const [present, dismiss] = useIonModal(WalletModal, {
		onDismiss: (data, role) => dismiss(data, role),
	});

	const openOnboardingModal = () => {
		present({
			onWillDismiss: (event) => {
			  
			},
		  });
	};

	useEffect(() => {
		if (_hasHydrated) {
			if (walletOnboardingShowed === false) {
				openOnboardingModal();
				updateWalletOnboardingShowed(true);
			}
		}
	},[walletOnboardingShowed,_hasHydrated]);

	const onBeginConnectWallet = () => {
		Browser.open({
			url: 'https://getalby.com/oauth?client_id=QBqT68cVBK&redirect_uri=https%3A%2F%2Fwww.podfriend.com%2Foauth%2Falby%2F&scope=account:read%20invoices:create%20invoices:read%20transactions:read%20balance:read%20payments:send',
			windowName: '_blank',
			toolbarColor: '#0176e5'
		})
		.then(() => {
			console.log('Wallet window opened');
		});
	};

	return (
		<Page id="wallet" title="Wallet" className="greyPage" showBackButton={false}>
			<div className="walletPageContainer">
				<div className="creditCardContainer">
					<CreditCard walletBalance={walletBalance} username={walletSetupCompleted ? userData?.username : 'Wallet not connected yet'} />
				</div>
				<div className="mobileFriendlyContainer">
					<IonList lines="full" inset={true} >
						<IonListHeader>
							<IonLabel>Your podcast wallet</IonLabel>
						</IonListHeader>
						{ walletSetupCompleted &&
							<>
								<IonItem detail={true}>
									<IonIcon icon={fundsIcon} slot="start" />
									Add funds
								</IonItem>
								<IonItem detail={true}>
									<IonIcon icon={historyIcon} slot="start" />
									Boost and Stream history
								</IonItem>
							</>
						}
						{ !walletSetupCompleted &&
							<IonItem detail={true} onClick={onBeginConnectWallet}>
								<IonIcon icon={historyIcon} slot="start" />
								Connect to Alby wallet
							</IonItem>
						}
						<IonItem detail={true} onClick={openOnboardingModal}>
							<IonIcon icon={helpIcon} slot="start" />
							Watch &quot;About&quot; again
						</IonItem>
					</IonList>
				</div>
			</div>
		</Page>
	);
};
export default WalletPage;