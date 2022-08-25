import { useRef } from 'react';

import { MemoryRouter as Router, Routes, Route, Redirect } from 'react-router-dom';
import './App.scss';

import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, IonMenu, IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import { calendar, personCircle, map, informationCircle } from 'ionicons/icons';

import WindowFrame from 'components/WindowFrame/WindowFrame';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import MainMenu from 'components/MainMenu/MainMenu';
import BottomMenu from 'components/BottomMenu/BottomMenu';

import useBreakpoint from 'use-breakpoint';

import Home from 'pages/Home/Home';
import FavoritePage from 'pages/FavoritePage/FavoritePage';
import DiscoverPage from 'pages/DiscoverPage/DiscoverPage';

// Should probably be defined somewhere else
const BREAKPOINTS = { mobile: 0, tablet: 850, desktop: 1280 };

setupIonicReact();

export default function App({ platform }) {
	const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, 'desktop');

	const showSplitPane = breakpoint === 'desktop';

	const routes = [
		<Route path="/home/" exact={true} render={(props) => <Home {...props} />} />,
		<Route path="/favorites/" render={(props) => <FavoritePage {...props} />} />,
		<Route path="/discover/" render={(props) => <DiscoverPage {...props} />} />,
		<Redirect exact from="/" to="home/" />
	].map((Route, index) => ({ ...Route, key: index }));

	return (
		<IonApp>
			<WindowFrame>
				<IonReactRouter>
					{ showSplitPane &&
						<IonSplitPane contentId="main">
								<MainMenu />
								<IonRouterOutlet id="main">
									{routes}
								</IonRouterOutlet>
						</IonSplitPane>
					}
					{ !showSplitPane &&
						<>
							<MainMenu />
							<BottomMenu routes={routes} />
						</>
					}
				</IonReactRouter>
			</WindowFrame>
		</IonApp>
	);
}