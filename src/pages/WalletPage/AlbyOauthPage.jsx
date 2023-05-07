import Page from "components/Page/Page";

import { useRef, useEffect, useState } from 'react';

import useStore from 'store/Store';

import { useLocation } from 'react-router';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonModal } from "@ionic/react";
import './WalletPage.scss';

const AlbyOauthPage = ({  }) => {
	const userData = useStore((state) => state.userData);

	const [status,setStatus] = useState(false);
	const [error,setError] = useState(false);
	const [errorMessage,setErrorMessage] = useState(false);

	const exchangeCodeToWalletToken = useStore((state) => state.exchangeCodeToWalletToken);
	const walletSetupCompleted = useStore((state) => state.walletSetupCompleted);
	
	const location = useLocation();

	useEffect(() => {
		if (walletSetupCompleted) {
			setStatus(true);
		}
		else {
			setStatus(false);
			setError(false);
			setErrorMessage(false);
			var searchParams = new URLSearchParams(location.search);
			var code = searchParams.get('code');
			if (code) {
				console.log('We have a code. Let us exchange it to a token');
				exchangeCodeToWalletToken(code)
				.then((response) => {
					console.log('response received');
					console.log(response);
					console.log(response.error);

					if (!response || response.error) {
						console.log('Error happened');
						setStatus(true);
						setError(true);
						if (!response) {
							setErrorMessage('No response from server.');
						}
						else if (response.error_description) {
							setErrorMessage(response.error_description);
						}
						else {
							setErrorMessage('No specific error message from server. This is likely an error on the Podfriend side.');
						}
					}
					else {
						console.log('No error happened');
						setStatus(true);
						setError(false);
					}
				})
				.catch((exception) => {
					console.log('failure');
					setStatus(true);
					setError(true);
				});
			}
		}
	},[location]);

	return (
		<Page id="wallet" title="Alby to Podfriend" showBackButton={false}>
			<div className="ion-padding">
				<>
					{ status === false &&
						<h1>Setting up connection</h1>
					}
					{ (status !== false && error !== true) &&
						<>
							<h1>Connection successful</h1>
							<p>Your connection to Alby is now working!</p>
							<br />
							<div>
								<IonButton routerLink="/wallet/" routerDirection="back">Go back to the wallet page</IonButton>
							</div>
						</>
					}
					{ (status !== false && error === true) &&
						<>
							<h1>Connection failed</h1>
							<p>
								We didn't manage to create a connection to your Alby wallet. Please try again.
							</p>
							<p>
								<b>Error description:</b><br />
								{errorMessage}
							</p>
						</>
					}
				</>
			</div>
		</Page>
	);
};
export default AlbyOauthPage;