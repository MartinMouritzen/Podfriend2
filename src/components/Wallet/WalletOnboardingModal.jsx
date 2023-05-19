import { useState, useEffect, useRef } from 'react';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent } from "@ionic/react";
import { Onboarding, OnboardingStep } from 'components/Onboarding/Onboarding';

import Value4ValueImage from 'images/onboarding/value4value.png';
import Value4ValueDonateImage from 'images/onboarding/value4value-donate.png';
import Value4ValueWalletImage from 'images/onboarding/value4value-wallet.png';
import Value4ValueAmountImage from 'images/onboarding/value4value-amount.png';
import Value4ValueDecisionImage from 'images/onboarding/value4value-decision.png';

const WalletOnboardingModal = ({ onDismiss }) => {
	const closeModal = () => {
		onDismiss();
	};


	return (
		
			<Onboarding closeModal={closeModal} skippable="Skip">
				<OnboardingStep illustration={Value4ValueImage} title="Podcast wallet" backgroundColor="#3caea3">
					<h2>Your podcast wallet</h2>
					<div>
						Your wallet empowers you, as a listener, to directly interact with and support your favorite podcast creators, ensuring they can continue to create great content.<br /><br />
						If and how you contribute is optional. This is a model called <b>Value 4 Value</b>. You decide what the content is worth to you.<br /><br />
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={Value4ValueDonateImage} title="Possibilities" backgroundColor="#20639b">
					<h2>You can interact by</h2>
					<div>
						<ul>
							<li><b>Boosting</b> shows</li>
							<li>Sending &quot;boostagram&quot; messages to podcasts</li>
							<li>Streaming value while listening</li>
							<li>and much more!</li>
						</ul>
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={Value4ValueWalletImage} title="Lightning fast" backgroundColor="#91be6d">
					<h2>It runs on Bitcoin</h2>
					<div>
						What's in your wallet are &quot;Satoshis&quot;. Satoshis are fractions of a Bitcoin.<br /><br />
						Using the Lightning network, sending Satoshis is a super efficient way to transfer value almost instantly between you and the podcast.
						
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={Value4ValueDecisionImage} title="It's optional" backgroundColor="#cebaef">
					<h2>Your choice</h2>
					<div>
						Using the wallet is completely optional.<br /><br />
						If you decide not to use it, you can still listen to all your favorite podcasts, just without as many interactive elements.
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={'https://getalby.com/assets/alby-logo-head-da6c4355b69a3baac3fc306d47741c9394a825e54905ef67c5dd029146b89edf.svg'} title="Alby" backgroundColor="#ffde6e">
					<h2>We work with Alby</h2>
					<div>
						Podfriend works with a wallet called Alby. Alby is a Bitcoin wallet, that allows you to buy small amounts of Bitcoin.<br /><br />
						Creating a wallet in Alby, means that you can connect it to Podfriend, to use as your Podcast wallet.
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={Value4ValueAmountImage} title="Alby" backgroundColor="#baf9c0">
					<h2>Ready, set, go!</h2>
					<div>
						After closing this guide, you'll be able to go to Alby's website, create a wallet and connect it with Podfriend.<br /><br />
						<a href="https://value4value.info/" target="_blank">You can also read more about Value 4 Value</a> (opens in a new window)
					</div>
				</OnboardingStep>
			</Onboarding>
		
	);
};
export default WalletOnboardingModal;