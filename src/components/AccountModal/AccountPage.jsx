import { IonAvatar, IonContent, IonItem, IonLabel, IonList, IonIcon } from "@ionic/react";

import { lockClosed as lockIcon } from 'ionicons/icons';

import useStore from 'store/Store';

const AccountPage = ({ dismiss }) => {
	const userData = useStore((state) => state.userData);
	const userNotLoggedIn = useStore((state) => state.userNotLoggedIn);

	console.log(userData);

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
			<IonList inset={true}>
				<IonItem className="ion-text-center" onClick={onSignOutClick}>
					<IonLabel color="danger">Sign out</IonLabel>
				</IonItem>
			</IonList>
		</IonContent>
	);
};
export default AccountPage;