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

	const [forgotPasswordInitiated,setForgotPasswordInitiated] = useState(false);

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

	const onForgotPassword = () => {
		setForgotPasswordInitiated('fill-email');
	};
	const onForgotPasswordContinue = () => {
		var url = "https://api.podfriend.com/user/reset-password/?email=" + email;
		fetch(url);
		setForgotPasswordInitiated('emailed');
	};

	return (
		<>
			<IonHeader className="blueModalHeader ion-no-border">
				<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton></IonBackButton>
				</IonButtons>
				
				</IonToolbar>
			</IonHeader>
			<IonContent className="blueContent">
				<div className="loginPage modalPage">
					<div className="teaser">
						<div className="teaserContent">
							<IonNavLink routerDirection='back' className='backLink'><IonIcon icon={backIcon} /> <IonLabel>Back</IonLabel></IonNavLink>
							<h2>Welcome back friend</h2>
						</div>
					</div>
					<div className="content">
						<div className="secondTeaser">
							{ forgotPasswordInitiated === 'emailed' &&
								<>
								<p>Great news</p>
								<p>An email has been sent to {email}, with instructions for resetting your password.</p>
							</>
							}
							{ forgotPasswordInitiated === 'fill-email' &&
								<>
									<p>Do not despair my friend!</p>
									<p>
										Fill out your email and we will send you an email to reset the password.
									</p>
								</>
							}
							{ forgotPasswordInitiated === false &&
								<>
									Let's get you signed in and start listening!
								</>
							}
						</div>
						<img src={BlueOnBlueWave} className="wave" />
						<div className="darkBlueContent">
							{ forgotPasswordInitiated === 'emailed' &&
								<div>
									<IonNavLink routerDirection='back' className='backLink'>
										<IonButton expand="block">Back to log in</IonButton>
									</IonNavLink>
								</div>
							}
							{ forgotPasswordInitiated === 'fill-email' &&
								<div>
									<IonItem>
										<IonLabel position="floating"><IonIcon icon={mailIcon} /> Email address</IonLabel>
										<IonInput type="email" value={email} onIonInput={onEmailChange} />
									</IonItem>
									<IonButton expand="block" onClick={onForgotPasswordContinue}>Continue</IonButton>
								</div>
							}
							{ forgotPasswordInitiated === false &&
								<form>
									<IonItem>
										<IonLabel position="floating"><IonIcon icon={mailIcon} /> Email address</IonLabel>
										
										<IonInput type="email" onIonInput={onEmailChange} value={email} />
										{ /* <input type="text" onKeyUp={onEmailChange} style={{ color: '#000000' }} /> */ }
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
									<div className="forgotPasswordLink" onClick={onForgotPassword}>
										Forgot password?
									</div>
								</form>
							}
						</div>
					</div>
				</div>
			</IonContent>
		</>
	);
};

export default LoginPage;