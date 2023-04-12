import { useState, useEffect, useRef } from 'react';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent, IonFooter } from "@ionic/react";

import './onboarding.scss';

const OnboardingStep = ({ children, illustration }) => {
	return (
		<div className="onboardingContent">
			<div className="onboardingImageContainer">
				<img src={illustration} />
			</div>
			<div className="onboardingText">
				{children}
			</div>
		</div>
	);
};
const Onboarding = ({ children, title, closeModal, skippable = "Close" }) => {
	const [step,setStep] = useState(1);

	const nextStep = () => {
		setStep(step + 1);
	};
	const prevStep = () => {
		setStep(step - 1);
	};

	const numberOfSteps = children.length;

	return (
		<>
			<IonHeader>
				<IonToolbar>
					{ step > 1 &&
						<IonButtons slot="start">
							<IonButton onClick={prevStep}>Back</IonButton>
						</IonButtons>
					}
					<IonTitle>{children[step -1].props.title}</IonTitle>
					{ skippable !== false &&
						<IonButtons slot="end">
							<IonButton onClick={closeModal}>{skippable}</IonButton>
						</IonButtons>
					}
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div className="onboardingScreen">
					{ children && children.map((child) => {
						console.log(child);
						if (child.props.step === step) {
							return child;
						}
					} )	}
					<div className="steps">
						{ Array.apply(null, { length: numberOfSteps }).map((e, i) => (
							<div className={'step ' + (i === step - 1 ? 'active' : '')}>&nbsp;</div>
						)) }
					</div>
				</div>
			</IonContent>
			<IonFooter>
				<IonToolbar>
					<IonButton expand='block' onClick={nextStep}>Continue</IonButton>
				</IonToolbar>
			</IonFooter>
		</>
	);
};
export { Onboarding, OnboardingStep };