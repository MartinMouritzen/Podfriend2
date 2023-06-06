import './MainMenu.scss';

import { useEffect, useState, useContext, useRef } from 'react';

import { IonMenu, IonItemDivider, IonSearchbar, IonHeader, IonContent, IonIcon, IonLabel, IonList, IonItem, IonToolbar, IonButtons, IonButton, IonMenuToggle, useIonRouter } from '@ionic/react';

import { menuController } from "@ionic/core/components";

import { homeOutline as homeIcon, closeSharp as closeIcon, searchOutline as searchIcon, mailOutline as mailIcon, listOutline as collectionsIcon, starOutline as favoriteIcon, walletOutline as walletIcon } from 'ionicons/icons'

import {NavContext} from '@ionic/react';

import PodfriendLogo from 'images/icons/podfriend_logo.svg';

import useStore from 'store/Store';

import { useLocation } from "react-router";

const MainMenu = () => {
	const location = useLocation();

	const toggleMenu = () => {
 	    menuController.toggle('first');
	};

	const {navigate} = useContext(NavContext);

	const router = useIonRouter();

	const searchBar = useRef(null);
	const [searchString,setSearchString] = useState('');

	const walletBalance = useStore((state) => state.walletBalance);

	const onSearch = (event) => {
		event.preventDefault();
		router.push("/search/" + searchBar.current.value)

		return false;
	};

	const [selected,setSelected] = useState('home');

	useEffect(() => {
		var selected = 'home';
		if (location.pathname.includes('favorites')) {
			selected = 'favorites';
		}
		else if (location.pathname.includes('wallet')) {
			selected = 'wallet';
		}
		else if (location.pathname.includes('search')) {
			selected = 'search';
		}
		else if (location.pathname.includes('contact')) {
			selected = 'contact';
		}
		setSelected(selected);
	},[location?.pathname]);

	return (
		<IonMenu menuId="first" contentId="main" side="start" className="mainMenu" swipe-gesture={false}>
			{ /*
			<IonHeader class="ion-no-border">
				<IonToolbar>
					<IonMenuToggle slot="end">
						<IonIcon icon={closeIcon}></IonIcon>
					</IonMenuToggle>
				</IonToolbar>
			</IonHeader>
			*/ }
			<div className="sidemenuHeader">
				<img src={PodfriendLogo} /> Podfriend
			</div>
			<IonContent className="menuContent">
				<form method="GET" onSubmit={onSearch}>
					<IonSearchbar type="search" placeholder="Search for podcasts" ref={searchBar}></IonSearchbar>
				</form>

				<div className="subHeader">
					My content
				</div>
				<IonList>
					<IonItem lines="none" button routerLink="/" className={selected === 'home' ? 'active' : ''}>
						<IonIcon icon={homeIcon} slot="start"></IonIcon>
						<IonLabel>Home</IonLabel>
					</IonItem>
					{ /*

					<IonItem lines="none" button routerLink="/playlist/">
						<IonIcon icon={collectionsIcon} slot="start"></IonIcon>
						<IonLabel>Playlist</IonLabel>
					</IonItem>
					*/ }

					<IonItem lines="none" button routerLink="/favorites/" className={selected === 'favorites' ? 'active' : ''}>
						<IonIcon icon={favoriteIcon} slot="start"></IonIcon>
						<IonLabel>Following</IonLabel>
					</IonItem>

					<IonItem lines="none" button routerLink="/wallet/" className={selected === 'wallet' ? 'active' : ''}>
						<IonIcon icon={walletIcon} slot="start"></IonIcon>
						<IonLabel>Wallet <span style={{ fontSize: 12 }}>
							{ (walletBalance !== false && walletBalance !== 0) && 
								<>({(walletBalance).toLocaleString()} sats)</>
							}
							</span>
						</IonLabel>
					</IonItem>

					{ /*
					<IonItem lines="none" button routerLink="/search/">
						<IonIcon icon={searchIcon} slot="start"></IonIcon>
						<IonLabel>Search</IonLabel>
					</IonItem>
					*/ }

					{ /*
					<IonItem lines="none" button routerLink="/collections/">
						<IonIcon icon={collectionsIcon} slot="start"></IonIcon>
						<IonLabel>My collections</IonLabel>
					</IonItem>
					*/ }

					<IonItemDivider>
						<hr />
					</IonItemDivider>
					<IonItem lines="none" button routerLink="/contact/" className={selected === 'contact' ? 'active' : ''}>
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