import { IonAvatar, IonContent, IonItem, IonLabel, IonList, IonIcon, IonCheckbox, IonToggle } from "@ionic/react";

import {
	lockClosed as lockIcon,
	mailOutline as mailIcon,
	newspaperOutline as guideIcon,
	duplicateOutline as importIcon
} from 'ionicons/icons';

import { Link } from 'react-router-dom';

import useStore from 'store/Store';

const AccountPage = ({ dismiss }) => {
	const userData = useStore((state) => state.userData);
	const userNotLoggedIn = useStore((state) => state.userNotLoggedIn);
	const setSeenPodfriendOnboarding = useStore((state) => state.setSeenPodfriendOnboarding);

	const settingsAutoContinue = useStore((state) => state.settings.autoContinue);
	const setSetting = useStore((state) => state.setSetting);

	const onAutoContinueSettingChange = (event) => {
		// console.log('onAutoContinueChange');
		// console.log(event.detail.checked);
		setSetting('autoContinue',event.detail.checked);
	};

	const onAccountChangeClicked = () => {
		alert('Account editing will be implemented soon');
	};
	const onSignOutClick = () => {
		if (confirm('Are you sure you want to log out of Podfriend?')) {
			userNotLoggedIn();
			dismiss();
		}
	};

	return (
		<IonContent className="greyPage">
			<IonList inset={true}>
				<IonItem detail={true} onClick={onAccountChangeClicked}>
					<IonAvatar slot="start">
						<img alt="Silhouette of a person's head" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
					</IonAvatar>
					<IonLabel>
						<h3>{userData.username}</h3>
						<p>{userData.email}</p>
						</IonLabel>
				</IonItem>
			</IonList>

{ /*
			<IonList inset={true}>
				<Link
					to={{
						pathname: '/podcasts/import/'
					}}
					style={{ textDecoration: 'none' }}
					onClick={dismiss}
				>
					<IonItem >
						<IonIcon icon={importIcon} slot="start" />
						<IonLabel>Import podcasts</IonLabel>
					</IonItem>
				</Link>
			</IonList>
				*/ }

			<IonList inset={true}>
				<IonItem>
					<IonToggle aria-label="Auto play next episode" checked={settingsAutoContinue} onIonChange={onAutoContinueSettingChange} labelPlacement="start">
						Auto play next episode
					</IonToggle>
				</IonItem>
			</IonList>

			<IonList inset={true}>
				<Link
					to={{
						pathname: '/contact/'
					}}
					style={{ textDecoration: 'none' }}
					onClick={dismiss}
				>
					<IonItem >
						<IonIcon icon={mailIcon} slot="start" />
						<IonLabel>Contact Podfriend</IonLabel>
					</IonItem>
				</Link>
				<Link
					to={{
						pathname: '/'
					}}
					style={{ textDecoration: 'none' }}
					onClick={() => { setSeenPodfriendOnboarding(false); dismiss(); }}
				>
					<IonItem>
						<IonIcon icon={guideIcon} slot="start" />
						<IonLabel>Watch Podfriend intro again</IonLabel>
					</IonItem>
				</Link>
			</IonList>

			<IonList inset={true}>
				<IonItem className="ion-text-center" onClick={onSignOutClick}>
					<IonLabel color="danger">Sign out</IonLabel>
				</IonItem>
			</IonList>
		</IonContent>
	);
};
export default AccountPage;