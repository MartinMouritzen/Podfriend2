import { useEffect, useState, useRef } from 'react';
import { IonButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonToolbar, IonTitle, IonButtons, IonNavLink, IonContent, IonBackButton, IonCheckbox } from "@ionic/react";

import { mailOutline as mailIcon, chevronBackOutline as backIcon, checkmarkCircleOutline as checkMark, lockClosedOutline as passwordIcon } from 'ionicons/icons';
import { useState } from "react";

import useStore from 'store/Store';

import LoginPage from "./LoginPage";
import SignUpPage from './SignUpPage';

import BlueOnBlueWave from './blueonblue_wave.svg';

const LoginPage = ({ dismiss }) => {
	const userLogin = useStore((state) => state.userLogin);
	const authToken = useStore((state) => state.authToken);
	const authenticateUser = useStore((state) => state.authenticateUser);

	const [password,setPassword] = useState('');
	const [email,setEmail] = useState('');

	const [overallError,setOverallError] = useState(false);

	const onPasswordChange = (event) => {
		setPassword(event.target.value);
	}
	const onEmailChange = (event) => {
		setEmail(event.target.value);
	}

	const onLogin = () => {
		setOverallError(false);
		userLogin(email,password)
		.then((result) => {
			if (result === false) {
				setOverallError('Wrong username or password.');
			}
		});
	}
	useEffect(() => {
		if (authToken) {
			authenticateUser();
			dismiss();
		}
	},[authToken]);

	return (
		<>
			<IonHeader className="blueModalHeader ion-no-border hideWhenKeyboardShown">
				<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton></IonBackButton>
				</IonButtons>
				
				</IonToolbar>
			</IonHeader>
			<IonContent className="blueContent">
				<div className="loginPage modalPage">
					<div className="teaser hideWhenKeyboardShown">
						<div className="teaserContent">
							<IonNavLink routerDirection='back' className='backLink'><IonIcon icon={backIcon} /> <IonLabel>Back</IonLabel></IonNavLink>
							<h2>Welcome back friend</h2>
						</div>
					</div>
					<div className="content">
						<div className="secondTeaser hideWhenKeyboardShown">
							Let's get you signed in and start listening!
						</div>
						<img src={BlueOnBlueWave} className="wave hideWhenKeyboardShown" />
						<div className="darkBlueContent">
							<form>
								<IonItem>
									<IonLabel position="floating"><IonIcon icon={mailIcon} /> Email address</IonLabel>
									
									<IonInput type="email" onIonInput={onEmailChange} />
								</IonItem>
								<IonItem>
									<IonLabel position="floating"><IonIcon icon={passwordIcon} /> Password</IonLabel>
									<IonInput type="password" onIonInput={onPasswordChange} />
								</IonItem>
								{ /*
								<IonItem lines="none" style={{ marginTop: 20 }}>
									<IonCheckbox />
									<IonLabel> Remember me</IonLabel>
								</IonItem>
								*/ }

								{ overallError &&
									<div style={{ padding: 20, paddingTop: 40 }}>
										<IonLabel color="danger">{overallError}</IonLabel>
									</div>
								}
									
								<IonButton expand="block" onClick={onLogin}>Sign in</IonButton>
								<div className="forgotPasswordLink">
									Forgot password?
								</div>
							</form>
						</div>
					</div>
				</div>
			</IonContent>
		</>
	);
};

export default LoginPage;