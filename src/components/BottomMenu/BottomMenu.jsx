
import { IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import {
	homeOutline as homeIcon,
	homeOutline as homeIconSelected,

	starOutline as favoriteIcon,
	starSharp as favoriteIconSelected,

	mapOutline as discoverIcon,
	mapSharp as discoverIconSelected,

	listOutline as podcastIcon,
	listSharp as podcastIconSelected,
	
	walletOutline as walletIcon,
	walletSharp as walletIconSelected
} from 'ionicons/icons';

const BottomMenu = ({ routes }) => {
	return (
		<IonTabs id="maintab">
			<IonRouterOutlet id="main">
				{routes}
			</IonRouterOutlet>
			<IonTabBar slot="bottom" className="bottomTabs">
				<IonTabButton tab="home" href="/home/">
					<IonIcon icon={homeIcon} />
					<IonLabel>Home</IonLabel>
				</IonTabButton>

				<IonTabButton tab="favorites" href="/favorites/">
					<IonIcon icon={favoriteIcon} />
					<IonLabel>Favorites</IonLabel>
				</IonTabButton>

				<IonTabButton tab="discover" href="/discover/">
					<IonIcon icon={discoverIcon} />
					<IonLabel>Discover</IonLabel>
				</IonTabButton>

				<IonTabButton tab="about" href="/wallet/">
					<IonIcon icon={walletIcon} />
					<IonLabel>Wallet</IonLabel>
				</IonTabButton>
			</IonTabBar>
		</IonTabs>
	);
};
export default BottomMenu;