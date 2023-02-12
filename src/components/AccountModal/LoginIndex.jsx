import { useState } from 'react';
import { IonButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonToolbar, IonTitle, IonButtons, IonNavLink, IonContent, IonBackButton, IonCheckbox } from "@ionic/react";

import { mailOutline as mailIcon, chevronBackOutline as backIcon, checkmarkCircleOutline as checkMark, lockClosedOutline as passwordIcon } from 'ionicons/icons';
import { useState } from "react";

import LoginPage from "./LoginPage";
import SignUpPage from './SignUpPage';

import BlueOnBlueWave from './blueonblue_wave.svg';

const LoginIndex = ({ dismiss }) => {

	return (
		<>
			<IonHeader className="blueModalHeader ion-no-border">
				<IonToolbar>
					
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div className="loginPage modalPage">
					<div className="teaser">
						<div className="teaserContent">
							<h2>Personalize your listening</h2>
							<p>
								Make the most of Podfriend
							</p>
						</div>
					</div>
					<div className="content">
						<div className="secondTeaser">
							<div className="teaserLine"><IonIcon icon={checkMark} /> Tailored recommendations</div>
							<div className="teaserLine"><IonIcon icon={checkMark} /> Listen on multiple devices</div>
							<div className="teaserLine"><IonIcon icon={checkMark} /> Share podcasts and lists</div>
						</div>
						<img src={BlueOnBlueWave} className="wave" />
						<div className="darkBlueContent">
							&nbsp;

							<IonNavLink routerDirection="forward" component={() => <LoginPage dismiss={dismiss} /> }>
								<IonButton expand="block" fill="outline">Sign in</IonButton>
							</IonNavLink>

							<div style={{ display: 'flex', marginTop: 15,paddingLeft: 5, paddingRight: 5 }}>
								<div style={{ borderBottom: '1px solid #999999', flex: 1, position: 'relative', bottom: 9 }}>&nbsp;</div>
								<div style={{ paddingLeft: 15, paddingRight: 15}}>or</div>
								<div style={{ borderBottom: '1px solid #999999', flex: 1, position: 'relative', bottom: 9 }}>&nbsp;</div>
							</div>


							<IonNavLink routerDirection="forward" component={() => <SignUpPage dismiss={dismiss} /> }>
								<IonButton expand="block" fill="solid">Create a free account</IonButton>
							</IonNavLink>
						</div>

						
					</div>
				</div>
			</IonContent>
		</>
	);
};
export default LoginIndex;