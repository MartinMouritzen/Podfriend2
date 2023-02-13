import { useEffect, useState } from 'react';

import { IonContent, IonButton, IonIcon, IonInput, IonItem, IonLabel, IonHeader, IonToolbar, IonButtons, IonBackButton, IonNavLink, IonSpinner, IonNote, useIonToast  } from "@ionic/react";

import { mailOutline as mailIcon, chevronBackOutline as backIcon, checkmarkCircleOutline as checkMark, personCircleOutline as userIcon, lockClosedOutline as passwordIcon } from 'ionicons/icons';

import useBreakpoint from 'use-breakpoint';
import { BREAKPOINTS } from 'constants/breakpoints';

import useStore from 'store/Store';

import BlueOnBlueWave from './blueonblue_wave.svg';

const TXT_ERROR_USERNAME_TOO_SHORT = 'Your username needs to be 3 or more characters long.';

timeoutId = false;

const SignUpPage = ({ dismiss }) => {
	const [username,setUsername] = useState('');
	const [password,setPassword] = useState('');
	const [email,setEmail] = useState('');
	const [creatingUser,setCreatingUser] = useState(false);
	const [createdUser,setCreatedUser] = useState(false);

	const [overallError,setOverallError] = useState(false);

	const [usernameError,setUsernameError] = useState(true);
	const [usernameIsFree,setUsernameIsFree] = useState(false);
	
	const [passwordError,setPasswordError] = useState(true);
	const [passwordIsMinLength,setPasswordIsMinLength] = useState(false);
	const [passwordContainsUppercase,setPasswordContainsUppercase] = useState(false);
	const [passwordContainsNumber,setPasswordContainsNumber] = useState(false);

	const [emailError,setEmailError] = useState(true);

	const checkIfUsernameExists = useStore((state) => state.checkIfUsernameExists);
	const createUser = useStore((state) => state.createUser);
	const authTokenReceived = useStore((state) => state.authTokenReceived);
	const authToken = useStore((state) => state.authToken);
	const authenticateUser = useStore((state) => state.authenticateUser);

	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const [presentToast] = useIonToast();

	const onUsernameChange = (event) => {
		setUsername(event.target.value);

		if (event.target.value.length <= 2) {
			setUsernameError(TXT_ERROR_USERNAME_TOO_SHORT);
			console.log('1');
		}
		else {
			setUsernameError(false);
			setUsernameIsFree(false);

			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				checkIfUsernameExists(event.target.value)
				.then((exists) => {
					if (exists) {
						setUsernameError('Username is taken');
					}
					else {
						setUsernameIsFree(true);
					}
				});
			},500);
		}
	}
	const onPasswordChange = (event) => {
		setPassword(event.target.value);
		setPasswordError(false);

		const hasNumber = (testString) => {
			return /\d/.test(testString);
		}

		if (event.target.value.length < 6) {
			setPasswordError(true);
			setPasswordIsMinLength(false);
		}
		else {
			setPasswordIsMinLength(true);
		}
		if (event.target.value.toLowerCase() === event.target.value) {
			setPasswordContainsUppercase(false);
			setPasswordError(true);
		}
		else {
			setPasswordContainsUppercase(true);
		}
		if (hasNumber(event.target.value)) {
			setPasswordContainsNumber(true);
		}
		else {
			setPasswordContainsNumber(false);
			setPasswordError(true);
		}
	}
	const onEmailChange = (event) => {
		setEmail(event.target.value);

		const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

		var isEmailValid = emailRegexp.test(event.target.value);

		setEmailError(!isEmailValid);

	}
	const onCreateUserFormSubmit = (event) => {
		event.preventDefault();
		setOverallError(false);

		if (!usernameError && !passwordError && !emailError) {
			setCreatingUser(true);

			var startTime = new Date();

			console.log(username);

			createUser(username,password,email)
			.then((data) => {
				var endTime = new Date();
				var timeDifference = endTime - startTime;
				
				var minimumTimeToDisplayLoading = 2500;
				var remainingTime = 0;

				if (timeDifference < minimumTimeToDisplayLoading) {
					remainingTime = minimumTimeToDisplayLoading - timeDifference;
				}

				setTimeout(() => {
					setCreatingUser(false);

					console.log(data.authToken);
					authTokenReceived(data.authToken);
				},remainingTime);
			})
			.catch((exception) => {
				console.log('error creating user');
				console.log(exception);
				setCreatingUser(false);
				setCreatedUser(false);
				setOverallError(exception);

				presentToast({
					message: exception,
					buttons: [
					  {
						text: 'Dismiss',
						role: 'cancel'
					  }
					]
				  })
			});
		}
		return false;
	}

	useEffect(() => {
		if (authToken) {
			authenticateUser();
			setCreatedUser(true);
		}
	},[authToken]);

	return (
		<>
			<IonHeader className="blueModalHeader ion-no-border">
				<IonToolbar>
				<IonButtons slot="start">
					{ !createdUser &&
						<IonBackButton></IonBackButton>
					}
				</IonButtons>
				
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div className="loginPage modalPage">
					<div className="teaser">
						<div className="teaserContent">
							{ !createdUser &&
								<>
									<IonNavLink routerDirection='back' className='backLink'><IonIcon icon={backIcon} /> <IonLabel>Back</IonLabel></IonNavLink>
									<h2>Creating account</h2>
									<p>Your free account is just one step away.</p>
								</>
							}
							{ createdUser &&
								<>
									<h2>Abso-fantasti-lute-full!</h2>
									<p>What a success.</p>
								</>
							}
						</div>
					</div>
					<div className="content">
						<div className="secondTeaser">
							{ !createdUser &&
								<>&nbsp;</>
							}
							{ createdUser &&
								<>
								<p style={{ fontWeight: 'bold' }}>Account created</p>
								<p>You've been logged in to your new account automatically.<br /><br />It's time to listen to podcasts!</p>
								</>
							}
						</div>
						<img src={BlueOnBlueWave} className="wave" />
						<div className="darkBlueContent">
							{ createdUser &&
								<IonButton expand="block" onClick={dismiss}>Start listening</IonButton>
							}
							{ !createdUser &&
								<>
									{ creatingUser &&
										<div style={{ textAlign: 'center', height: 200,marginTop: 50 }}>
											{ breakpoint === 'desktop' &&
												<div><IonSpinner color="dark" /></div>
											}
											{ breakpoint !== 'desktop' &&
												<div><IonSpinner color="light" /></div>
											}
											<div style={{ marginTop: 40 }}>Creating user</div>
										</div>
									}
									{ !creatingUser &&
										<form onSubmit={onCreateUserFormSubmit}>
											<IonItem className={usernameError ? 'ion-invalid' : 'ion-valid'}>
												<IonLabel position="floating"><IonIcon icon={userIcon} /> Username</IonLabel>
												<IonInput type="text" value={username}  onIonInput={onUsernameChange} />
												{ !usernameError && !usernameIsFree &&
													<IonNote slot="helper">Your username is visible to other users</IonNote>
												}
												{ usernameError &&
													<IonNote slot="error">{usernameError}</IonNote>
												}
												{ !usernameError && usernameIsFree &&
													<IonNote color="success" slot="helper">Username available</IonNote>
												}
											</IonItem>
											<IonItem>
												<IonLabel position="floating"><IonIcon icon={passwordIcon} /> Password</IonLabel>
												<IonInput type="password" value={password} clearOnEdit={false} onIonInput={onPasswordChange} />
												<IonNote slot="helper"><span style={{ color: passwordIsMinLength ? 'var(--ion-color-success)' : '' }}>At least 8 characters</span>, <span style={{ color: passwordContainsUppercase ? 'var(--ion-color-success)' : '' }}>one uppercase</span> and <span style={{ color: passwordContainsNumber ? 'var(--ion-color-success)' : '' }}>one number</span></IonNote>
											</IonItem>


											<IonItem>
												<IonLabel position="floating"><IonIcon icon={mailIcon} /> Email address</IonLabel>
												<IonInput type="email" value={email} onIonInput={onEmailChange} />
												<IonNote slot="helper">Your email is not shown to other users</IonNote>
											</IonItem>

											{ overallError &&
												<div style={{ padding: 20, paddingTop: 40 }}>
													<IonLabel color="danger">{overallError}</IonLabel>
												</div>
											}

											{ !usernameError && !passwordError && !emailError &&
												<IonButton type="submit" expand="block" onClick={onCreateUserFormSubmit}>Create account</IonButton>
											}
											{ (usernameError || passwordError || emailError) &&
												<IonButton type="submit" expand="block" disabled={true}>Create account</IonButton>
											}
										</form>
									}
								</>
							}
						</div>
					</div>
				</div>
			</IonContent>
		</>
	);
};
export default SignUpPage;