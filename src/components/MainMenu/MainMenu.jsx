import './MainMenu.scss';

import { IonMenu, IonSearchbar, IonHeader, IonContent, IonIcon } from '@ionic/react';

import { searchSharp } from 'ionicons/icons'

const MainMenu = () => {
	return (
		<IonMenu contentId="main" side="start" type="push" className="mainMenu">
			<IonHeader>
				&nbsp;
			</IonHeader>
			<IonContent>
				<IonSearchbar type="search" placeholder="Search"></IonSearchbar>

				<ion-header className="subHeader">
					<ion-title>My content</ion-title>
				</ion-header>
				<ion-list>
					<ion-item lines="none">Home</ion-item>
					<ion-item lines="none">Random podcast</ion-item>
					<ion-item lines="none">Wallet</ion-item>
				</ion-list>

				<ion-header className="subHeader">
					<ion-title>Discover</ion-title>
				</ion-header>
				<ion-list>
					<ion-item lines="none">Menu Item</ion-item>
					<ion-item lines="none">Menu Item</ion-item>
					<ion-item lines="none">Menu Item</ion-item>
					<ion-item lines="none">Menu Item</ion-item>
				</ion-list>
			</IonContent>
		</IonMenu>
	);
};
export default MainMenu;