import Page from "components/Page/Page";

import { useRef, useEffect } from 'react';

import useStore from 'store/Store';

import CreditCard from "components/Wallet/CreditCard";

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonModal } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon,
	helpCircleOutline as helpIcon,
	alertCircleOutline as noticeIcon
} from 'ionicons/icons';

import { Browser } from '@capacitor/browser';

import './WalletPage.scss';
import WalletModal from "components/Wallet/WalletModal";

const WalletPage = ({  }) => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);
	const walletBalance = useStore((state) => state.walletBalance);
	const walletSetupCompleted = useStore((state) => state.walletSetupCompleted);
	const walletOnboardingShowed = useStore((state) => state.walletOnboardingShowed);
	const updateWalletOnboardingShowed = useStore((state) => state.updateWalletOnboardingShowed);
	const legacyWalletBalance = useStore((state) => state.legacyWalletBalance);
	const synchronizeLegacyWallet = useStore((state) => state.synchronizeLegacyWallet);
	
	const setShowingLoginModal = useStore((state) => state.setShowingLoginModal);

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
		if (walletOnboardingShowed === false) {
			openOnboardingModal();
			updateWalletOnboardingShowed(true);
		}
		synchronizeLegacyWallet();
	},[walletOnboardingShowed]);

	const onBeginConnectWallet = () => {
		var albyOathUrl = 'https://getalby.com/oauth?client_id=QBqT68cVBK&redirect_uri=https%3A%2F%2Fwww.podfriend.com%2Foauth%2Falby%2F&scope=account:read%20invoices:create%20invoices:read%20transactions:read%20balance:read%20payments:send';
		if (process.env.NODE_ENV === 'development') {
			console.log('Using development Alby address');
			albyOathUrl = 'https://app.regtest.getalby.com/oauth?client_id=test_client&response_type=code&redirect_uri=http%3A%2F%2Flocalhost:8080%2Foauth%2Falby%2F&scope=account:read%20invoices:create%20invoices:read%20transactions:read%20balance:read%20payments:send';
		}

		console.log(albyOathUrl);

		Browser.open({
			url: albyOathUrl,
			windowName: '_blank',
			toolbarColor: '#0176e5'
		})
		.then(() => {
			console.log('Wallet window opened');
		});
	};

	const onLoginClicked = () => {
		setShowingLoginModal(true);
	};

	return (
		<Page id="wallet" title="Wallet" className="greyPage" showBackButton={false}>
			<div className="walletPageContainer">
				<div>
					<div className="creditCardContainer">
						<CreditCard walletBalance={walletBalance} username={walletSetupCompleted ? userData?.username : 'Wallet not connected yet'} />
					</div>
					{ legacyWalletBalance > 0 &&
						<div className="legacyContainer">
							<div className="legacyNotice">
								<div className="iconContainer">
									<IonIcon icon={noticeIcon} />
								</div>
								<div>
									<div className="textContainer">
										<h3>Legacy value available</h3>
										You have <b>{legacyWalletBalance}</b> satoshis in your legacy Podfriend wallet.
									</div>
									{ walletSetupCompleted &&
										<IonButton expand="block">Transfer legacy balance to new vallet</IonButton>
									}
									{ !walletSetupCompleted &&
										<div>
											Connect your Alby wallet to transfer the old balance to your new wallet.
										</div>
									}
								</div>
							</div>
						</div>
					}
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
						{ !walletSetupCompleted && !loggedIn &&
							<IonItem detail={true} onClick={onLoginClicked}>
								<IonIcon icon={historyIcon} slot="start" />
								Log in to connect wallet
							</IonItem>
						}
						{ !walletSetupCompleted && loggedIn &&
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