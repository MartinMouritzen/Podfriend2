import { useState, useEffect, useRef } from 'react';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent } from "@ionic/react";
import { Onboarding, OnboardingStep } from 'components/Onboarding/Onboarding';

import useStore from 'store/Store';

import PodcastImage from 'images/onboarding/podfriend-listen.png';
import SynchronizeImage from 'images/onboarding/synchronize.png';
import AccountImage from 'images/onboarding/account.png';


const NewUserOnboardingModal = ({ dismiss }) => {
	const setShowingLoginModal = useStore((state) => state.setShowingLoginModal);
	const setSeenPodfriendOnboarding = useStore((state) => state.setSeenPodfriendOnboarding);

	const closeModal = () => {
		setSeenPodfriendOnboarding(true);
		dismiss();
	};

	const onCreateUser = () => {
		setShowingLoginModal(true);
		closeModal();
	};


	return (
		
			<Onboarding closeModal={closeModal} skippable="Skip" lastButtonTitle="Log In or Create an Account" lastButtonFunction={onCreateUser}>
				<OnboardingStep illustration={PodcastImage} title="Welcome to Podfriend" backgroundColor="#FFFFFF">
					<h2>Podfriend is a podcast app</h2>
					<div>
						<p>Podfriend is your gateway to the world of podcasts - audio or video shows covering diverse topics, all for free!</p>
						<p>Podfriend connects you to an abundance of global and local podcasts, kickstarting your learning and entertainment journey.</p>
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={SynchronizeImage} title="Listen where you want" backgroundColor="#FFFFFF">
					<h2>Sync across devices</h2>
					<div>
						<p>
							Listen on your morning commute on your smartphone, continue on your office computer, and finish at home on your tablet.
						</p>
						<p>
							Creating an account also enables interactive features like leaving comments and reviews!
						</p>
					</div>
				</OnboardingStep>
				<OnboardingStep illustration={AccountImage} title="Create account?" backgroundColor="#FFFFFF">
					<h2>Get the most out of Podfriend</h2>
					<div>
						<p>We recommend creating a free account, but you can also continue as a guest.<br /><br /> You won't be able to sync across devices or leave reviews or comments, but you can always create an account later.</p>
						<p><IonButton onClick={closeModal} fill="clear" expand="block">Try Podfriend without creating an account</IonButton></p>
					</div>
				</OnboardingStep>
			</Onboarding>
		
	);
};
export default NewUserOnboardingModal;