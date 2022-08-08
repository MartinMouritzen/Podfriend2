import './MainMenu.scss';

import { IonMenu, IonSearchbar, IonHeader, IonContent, IonIcon, IonLabel, IonList, IonItem, IonToolbar, IonButtons, IonButton, IonMenuToggle } from '@ionic/react';

import { menuController } from "@ionic/core/components";

import { closeSharp as closeIcon, searchOutline as searchIcon, mailOutline as mailIcon, bulbOutline as bulbIcon, walletOutline as walletIcon } from 'ionicons/icons'

const MainMenu = () => {
	const toggleMenu = () => {
 	    menuController.toggle('first');
	};

	return (
		<IonMenu menuId="first" contentId="main" side="start" className="mainMenu" maxEdgeStart={100} swipe-gesture={true}>
			<IonHeader>
				<IonToolbar>
					<IonMenuToggle slot="end">
						<IonIcon icon={closeIcon}></IonIcon>
					</IonMenuToggle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="menuContent">
				<IonSearchbar type="search" placeholder="Search"></IonSearchbar>

				<div className="subHeader">
					My content
				</div>
				<IonList>
					<IonItem lines="none" button>
						<IonIcon icon={searchIcon} slot="start"></IonIcon>
						<IonLabel>Home</IonLabel>
					</IonItem>
					<IonItem lines="none" button>
						<IonIcon icon={bulbIcon} slot="start"></IonIcon>
						<IonLabel>Explore random</IonLabel>
					</IonItem>
					<IonItem lines="none" button>
						<IonIcon icon={walletIcon} slot="start"></IonIcon>
						<IonLabel>Wallet</IonLabel>
					</IonItem>
					<IonItem lines="none" button>
						<IonIcon icon={mailIcon} slot="start"></IonIcon>
						<IonLabel>Contact us</IonLabel>
					</IonItem>
				</IonList>
				{/*
				<div className="subHeader">
					My podcasts
				</div>
				<ion-list>
					<IonItem lines="none">
						<IonIcon icon={searchSharp} slot="start"></IonIcon>
						<IonLabel>Home</IonLabel>
					</IonItem>
					<IonItem lines="none">
						<IonIcon icon={bulbSharp} slot="start"></IonIcon>
						<IonLabel>Explore random</IonLabel>
					</IonItem>
					<IonItem lines="none">
						<IonIcon icon={walletSharp} slot="start"></IonIcon>
						<IonLabel>Wallet</IonLabel>
					</IonItem>
					<IonItem lines="none">
						<IonIcon icon={mailSharp} slot="start"></IonIcon>
						<IonLabel>Contact us</IonLabel>
					</IonItem>
				</ion-list>
				*/ }
			</IonContent>
		</IonMenu>
	);
};
export default MainMenu;