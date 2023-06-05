import Page from "components/Page/Page";

import { useRef, useEffect, useState } from 'react';

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

// import { Browser } from '@capacitor/browser';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';

import './WalletPage.scss';
import WalletOnboardingModal from "components/Wallet/WalletOnboardingModal";

const WalletPage = ({  }) => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);
	const walletBalance = useStore((state) => state.walletBalance);

	const updateAccountBalance = useStore((state) => state.updateAccountBalance);
	// const updateWalletHistory = useStore((state) => state.updateWalletHistory);
	

	const walletSetupCompleted = useStore((state) => state.walletSetupCompleted);
	const walletOnboardingShowed = useStore((state) => state.walletOnboardingShowed);
	const updateWalletOnboardingShowed = useStore((state) => state.updateWalletOnboardingShowed);
	const legacyWalletBalance = useStore((state) => state.legacyWalletBalance);
	const synchronizeLegacyWallet = useStore((state) => state.synchronizeLegacyWallet);
	const exchangeCodeToWalletToken = useStore((state) => state.exchangeCodeToWalletToken);
	
	const setShowingLoginModal = useStore((state) => state.setShowingLoginModal);
	const onDisconnectWallet = useStore((state) => state.onDisconnectWallet);

	const [showSuccessMessage,setShowSuccessMessage] = useState(false);

	// console.log(userData);

	const [present, dismiss] = useIonModal(WalletOnboardingModal, {
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
		if (walletSetupCompleted) {
			updateAccountBalance();
		}
		// synchronizeLegacyWallet();
	},[walletOnboardingShowed]);

	const onBeginConnectWallet = () => {
		setShowSuccessMessage(false);
		var albyUrl = 'https://getalby.com/oauth?client_id=QBqT68cVBK&redirect_uri=https%3A%2F%2Fwww.podfriend.com%2Foauth%2Falby%2F&scope=account:read%20invoices:create%20invoices:read%20transactions:read%20balance:read%20payments:send';

		var ref = InAppBrowser.create(albyUrl, '_blank',{
			location: 'no',
			hideurlbar: 'yes',
			toolbarcolor: '#0176E5',
			footer: 'yes'

		});
		var eventObserver = ref.on('loadstart');
		// This only works on mobile, so we need to check.
		if (eventObserver) {
			eventObserver.subscribe((event) => {
				if (event && event.url) {
					if (event.url.indexOf('https://www.podfriend.com/oauth/alby/?code=') === 0) {
    					var code = event.url.substring('https://www.podfriend.com/oauth/alby/?code='.length);
						ref.close();

						exchangeCodeToWalletToken(code)
						.then((response) => {
							setShowSuccessMessage(true);
						})
						.catch((error) => {
							console.log('Error converting code to token on WalletPage');
							console.log(error);	
						});
					}
				}
			});
		}
	};

	const onLoginClicked = () => {
		setShowingLoginModal(true);
	};

	const addFunds = () => {
		var albyUrl = 'https://getalby.com/topup';
		var ref = InAppBrowser.create(albyUrl, '_blank',{
			location: 'no',
			hideurlbar: 'yes',
			toolbarcolor: '#0176E5',
			footer: 'yes'

		});
	};

	return (
		<Page id="wallet" title="Wallet" showBackButton={false}>
			<div className="walletPageContainer">
				<div>
					<div className="creditCardContainer">
						<CreditCard walletBalance={walletBalance} username={walletSetupCompleted ? userData?.username : 'Wallet not connected yet'} />
					</div>
					{ (false && legacyWalletBalance > 0) &&
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
					<IonList lines="full" inset={true} className="greyList">
						<IonListHeader>
							<IonLabel>Your podcast wallet</IonLabel>
						</IonListHeader>
						{ showSuccessMessage &&
							<div className="ion-padding">
								<IonLabel color="success">
									Successfully connected your Alby wallet
								</IonLabel>
							</div>
						}
						{ walletSetupCompleted &&
							<>
								<IonItem detail={true} onClick={addFunds}>
									<IonIcon icon={fundsIcon} slot="start" />
									Add funds (Through Alby)
								</IonItem>

								<IonItem detail={true} routerLink="/wallet/history/" button routerDirection="forward">
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
						{ walletSetupCompleted && loggedIn &&
							<IonItem detail={true} onClick={() => { if (confirm('Are you sure you want to disconnect Alby and Podfriend?')) { onDisconnectWallet(); }}} color="danger" >
								<IonIcon icon={turnOffIcon} slot="start" />
								<IonLabel>Disconnect Alby wallet</IonLabel>
							</IonItem>
						}
					</IonList>
				</div>
			</div>
		</Page>
	);
};
export default WalletPage;