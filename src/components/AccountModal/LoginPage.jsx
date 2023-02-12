import { useState } from 'react';
import { IonButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonToolbar, IonTitle, IonButtons, IonNavLink, IonContent, IonBackButton, IonCheckbox } from "@ionic/react";

import { mailOutline as mailIcon, chevronBackOutline as backIcon, checkmarkCircleOutline as checkMark, lockClosedOutline as passwordIcon } from 'ionicons/icons';
import { useState } from "react";

import LoginPage from "./LoginPage";
import SignUpPage from './SignUpPage';

import BlueOnBlueWave from './blueonblue_wave.svg';

const LoginPage = () => {
	return (
		<>
			<IonHeader className="blueModalHeader ion-no-border">
				<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton></IonBackButton>
				</IonButtons>
				
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div className="loginPage modalPage">
					<div className="teaser">
						<div className="teaserContent">
							<IonNavLink routerDirection='back' className='backLink'><IonIcon icon={backIcon} /> <IonLabel>Back</IonLabel></IonNavLink>
							<h2>Welcome back friend</h2>

						</div>
					</div>
					<div className="content">
						<div className="secondTeaser">
							Let's get you signed in and start listening!
						</div>
						<img src={BlueOnBlueWave} className="wave" />
						<div className="darkBlueContent">
							<IonItem>
								<IonLabel position="floating"><IonIcon icon={mailIcon} /> Email address</IonLabel>
								
								<IonInput type="email"  />
							</IonItem>
							<IonItem>
								<IonLabel position="floating"><IonIcon icon={passwordIcon} /> Password</IonLabel>
								<IonInput type="password"  />
							</IonItem>
							<IonItem lines="none" style={{ marginTop: 20 }}>
								<IonCheckbox />
								<IonLabel> Remember me</IonLabel>
							</IonItem>
								
							<IonButton expand="block">Sign in</IonButton>
							<div className="forgotPasswordLink">
								Forgot password?
							</div>
						</div>
					</div>
				</div>
			</IonContent>
		</>
	);
};

export default LoginPage;