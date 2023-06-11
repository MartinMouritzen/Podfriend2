
import { IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonFooter } from '@ionic/react';
import Player from 'components/Player/Player';
import {
	homeOutline as homeIcon,
	home as homeIconSelected,

	heartOutline as followedIcon,
	heart as followedIconSelected,

	mapOutline as discoverIcon,
	map as discoverIconSelected,

	listOutline as podcastIcon,
	list as podcastIconSelected,

	listOutline as collectionsIcon,
	list as collectionsIconSelected,

	listOutline as playlistIcon,
	list as playlistIconSelected,
	
	walletOutline as walletIcon,
	wallet as walletIconSelected,

	searchOutline as searchIcon,
	search as searchIconSelected
} from 'ionicons/icons';

import { useState, useEffect } from 'react';
import { useLocation } from "react-router";
import useStore from 'store/Store';

const BottomMenu = ({ routes }) => {
	const location = useLocation();
	const [selected,setSelected] = useState('home');

	const walletBalance = useStore((state) => state.walletBalance);

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
		setSelected(selected);
	},[location?.pathname]);


	return (
			<IonTabBar slot="bottom" className="bottomTabs" translucent={true}>
				<IonTabButton tab="home" href="/" selected={selected === 'home'}>
					<IonIcon icon={selected === 'home' ? homeIconSelected : homeIcon} />
					<IonLabel>Home</IonLabel>
				</IonTabButton>
				{ /*
				<IonTabButton tab="playlist" href="/playlist/">
					<IonIcon icon={playlistIcon} />
					<IonLabel>Playlist</IonLabel>
				</IonTabButton>
				*/ }

				<IonTabButton tab="favorites" href="/favorites/" selected={selected === 'favorites'}>
					<IonIcon icon={selected === 'favorites' ? followedIconSelected : followedIcon} />
					<IonLabel>Following</IonLabel>
				</IonTabButton>

				<IonTabButton tab="about" href="/wallet/" selected={selected === 'wallet'}>
					<IonIcon icon={selected === 'wallet' ? walletIconSelected : walletIcon} />
					<IonLabel>
						{ (walletBalance !== false && walletBalance !== 0) &&
							<>{(walletBalance).toLocaleString()}</>
						}
						{ (walletBalance === false || walletBalance === 0) &&
							<>Wallet</>
						}
					</IonLabel>
				</IonTabButton>

				<IonTabButton tab="search" href="/search/" selected={selected === 'search'}>
					<IonIcon icon={selected === 'search' ? searchIconSelected : searchIcon} />
					<IonLabel>Search</IonLabel>
				</IonTabButton>
			</IonTabBar>
	);
};
export default BottomMenu;