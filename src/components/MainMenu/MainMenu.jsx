import './MainMenu.scss';

import { useEffect, useState, useContext } from 'react';

import { IonMenu, IonItemDivider, IonSearchbar, IonHeader, IonContent, IonIcon, IonLabel, IonList, IonItem, IonToolbar, IonButtons, IonButton, IonMenuToggle, useIonRouter } from '@ionic/react';

import { menuController } from "@ionic/core/components";

import { homeOutline as homeIcon, closeSharp as closeIcon, searchOutline as searchIcon, mailOutline as mailIcon, listOutline as collectionsIcon, starOutline as favoriteIcon, walletOutline as walletIcon } from 'ionicons/icons'

import {NavContext} from '@ionic/react';

const MainMenu = () => {
	const toggleMenu = () => {
 	    menuController.toggle('first');
	};

	const {navigate} = useContext(NavContext);

	const router = useIonRouter();

	const onSearch = (event) => {
		var searchString = event.detail.value;
		console.log(searchString);
		console.log(history);
		// router.push("/search/" + searchString)

		navigate("/search/" + event.detail.value,"none","replace");

		/*
		router.push({
			pathname: "/search/" + searchString,
			routerDirection: 'none',
			routeAction: 'replace'
		})
		*/
	};

	return (
		<IonMenu menuId="first" contentId="main" side="start" className="mainMenu" swipe-gesture={false}>
			<IonHeader class="ion-no-border">
				<IonToolbar>
					<IonMenuToggle slot="end">
						<IonIcon icon={closeIcon}></IonIcon>
					</IonMenuToggle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="menuContent">
				<IonSearchbar type="search" placeholder="Search" debounce={1000} onIonChange={onSearch}></IonSearchbar>

				<div className="subHeader">
					My content
				</div>
				<IonList>
					<IonItem lines="none" button routerLink="/home/">
						<IonIcon icon={homeIcon} slot="start"></IonIcon>
						<IonLabel>Home</IonLabel>
					</IonItem>
					<IonItem lines="none" button routerLink="/search/">
						<IonIcon icon={searchIcon} slot="start"></IonIcon>
						<IonLabel>Find podcasts</IonLabel>
					</IonItem>
					<IonItem lines="none" button routerLink="/favorites/">
						<IonIcon icon={favoriteIcon} slot="start"></IonIcon>
						<IonLabel>Favorites</IonLabel>
					</IonItem>
					<IonItem lines="none" button routerLink="/collections/">
						<IonIcon icon={collectionsIcon} slot="start"></IonIcon>
						<IonLabel>My collections</IonLabel>
					</IonItem>
					<IonItem lines="none" button routerLink="/podcasts/">
						<IonIcon icon={walletIcon} slot="start"></IonIcon>
						<IonLabel>Wallet</IonLabel>
					</IonItem>
					<IonItemDivider>
						<hr />
					</IonItemDivider>
					<IonItem lines="none" button routerLink="/podcasts/">
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