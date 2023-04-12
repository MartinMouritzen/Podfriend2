import { useState, useEffect, useRef } from 'react';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent } from "@ionic/react";
import { Onboarding, OnboardingStep } from 'components/Onboarding/Onboarding';

import Value4ValueImage from 'images/onboarding/value4value.png';
import Value4ValueDonateImage from 'images/onboarding/value4value-donate.png';
import Value4ValueWalletImage from 'images/onboarding/value4value-wallet.png';
import Value4ValueAmountImage from 'images/onboarding/value4value-amount.png';
import Value4ValueDecisionImage from 'images/onboarding/value4value-decision.png';

const WalletModal = () => {
	const modal = useRef(null);

	const closeModal = () => {

	};

	return (
		<IonModal ref={modal} trigger="open-wallet-modal" canDismiss={true}>
			<Onboarding closeModal={closeModal} skippable="Skip">
				<OnboardingStep step={1} illustration={Value4ValueImage} title="Value 4 value" backgroundColor="#3caea3">
					<h2>Introducing Value 4 Value</h2>
					<div>
						Many shows follow a model called &quot;Value 4 Value&quot;.<br /><br />
						This empowers you, as a listener, to directly interact with and support your favorite podcast creators, ensuring they can continue to create great content.
					</div>
				</OnboardingStep>
				<OnboardingStep step={2} illustration={Value4ValueDonateImage} title="Introducing value 4 value" backgroundColor="#3caea3">
					<h2>You can</h2>
					<div>
						<ul>
							<li><b>Boost</b> shows</li>
							<li>Send &quot;boostagram&quot; messages to podcasts</li>
							<li>Stream value while listening</li>
							<li>Promote shows</li>
							<li>and much more!</li>
						</ul>
					</div>
				</OnboardingStep>
				<OnboardingStep step={3} illustration={Value4ValueWalletImage}>
					<h2>How it works</h2>
					<div>
						We work with a provider called Alby
					</div>
				</OnboardingStep>
				<OnboardingStep step={4} illustration={Value4ValueAmountImage}>
					<h2>Connect with Alby</h2>
					<div>Many shows run on what's called the &quot;Value 4 Value&quot; model.<br /><br /> This empowers you to directly support your favorite podcast creators and enjoy ad-free content.</div>
				</OnboardingStep>
				<OnboardingStep step={5} illustration={Value4ValueDecisionImage}>
					<h2>Connect with Alby</h2>
					<div>Many shows run on what's called the &quot;Value 4 Value&quot; model.<br /><br /> This empowers you to directly support your favorite podcast creators and enjoy ad-free content.</div>
				</OnboardingStep>
			</Onboarding>
		</IonModal>
	);
};
export default WalletModal;