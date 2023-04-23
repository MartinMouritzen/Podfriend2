import { IonAvatar, IonContent, IonItem, IonLabel, IonList, IonIcon } from "@ionic/react";

import { lockClosed as lockIcon, mailOutline as mailIcon } from 'ionicons/icons';
// import { homeOutline as homeIcon, closeSharp as closeIcon, searchOutline as searchIcon, mailOutline as mailIcon, listOutline as collectionsIcon, starOutline as favoriteIcon, walletOutline as walletIcon } from 'ionicons/icons'

import { Link } from 'react-router-dom';

import useStore from 'store/Store';

const AccountPage = ({ dismiss }) => {
	const userData = useStore((state) => state.userData);
	const userNotLoggedIn = useStore((state) => state.userNotLoggedIn);

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
				<Link
					to={{
						pathname: '/contact/'
					}}
					style={{ textDecoration: 'none' }}
					onClick={() => { dismiss(); }}
				>
					<IonItem >
						<IonIcon icon={mailIcon} slot="start" />
						<IonLabel>Contact Podfriend</IonLabel>
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