
import { IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonFooter } from '@ionic/react';
import Player from 'components/Player/Player';
import {
	homeOutline as homeIcon,
	homeOutline as homeIconSelected,

	starOutline as favoriteIcon,
	starSharp as favoriteIconSelected,

	mapOutline as discoverIcon,
	mapSharp as discoverIconSelected,

	listOutline as podcastIcon,
	listSharp as podcastIconSelected,

	listOutline as collectionsIcon,
	listSharp as collectionsIconSelected,

	listOutline as playlistIcon,
	listSharp as playlistIconSelected,
	
	walletOutline as walletIcon,
	walletSharp as walletIconSelected,

	searchOutline as searchIcon,
	searchSharp as searchIconSelected
} from 'ionicons/icons';

const BottomMenu = ({ routes }) => {
	
	return (
			<IonTabBar slot="bottom" className="bottomTabs">
				<IonTabButton tab="home" href="/">
					<IonIcon icon={homeIcon} />
					<IonLabel>Home</IonLabel>
				</IonTabButton>
				{ /*
				<IonTabButton tab="playlist" href="/playlist/">
					<IonIcon icon={playlistIcon} />
					<IonLabel>Playlist</IonLabel>
				</IonTabButton>
				*/ }

				<IonTabButton tab="favorites" href="/favorites/">
					<IonIcon icon={favoriteIcon} />
					<IonLabel>Favorites</IonLabel>
				</IonTabButton>

				<IonTabButton tab="about" href="/wallet/">
					<IonIcon icon={walletIcon} />
					<IonLabel>Wallet</IonLabel>
				</IonTabButton>

				<IonTabButton tab="search" href="/search/">
					<IonIcon icon={searchIcon} />
					<IonLabel>Search</IonLabel>
				</IonTabButton>
			</IonTabBar>
	);
};
export default BottomMenu;