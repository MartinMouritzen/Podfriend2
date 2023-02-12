import { useEffect, useRef } from 'react';

import { MemoryRouter as Router, Routes, Route, Redirect } from 'react-router-dom';
import './App.scss';

import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, IonMenu, IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonGrid, IonRow } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

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
import PodcastPage from 'pages/PodcastPage/PodcastPage';
import SearchPage from 'pages/SearchPage/SearchPage';

import useStore from 'store/Store';

import Player from 'components/Player/Player';

import { BREAKPOINTS } from 'constants/breakpoints';

setupIonicReact({
	mode: 'ios',
	swipeBackEnabled: true

});

export default function App({ platform, audioController }) {
	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const showSplitPane = breakpoint === 'desktop';

	const setAudioController = useStore((state) => state.setAudioController);

	useEffect(() => {
		setAudioController(audioController);
	},[]);

	const routes = [
		<Route path="/home/" exact={true} render={(props) => <Home {...props} />} />,
		<Route path="/discover/" render={(props) => <DiscoverPage {...props} />} />,
		<Route path="/favorites/" render={(props) => <FavoritePage {...props} />} />,
		<Route path="/collections/" render={(props) => <Home {...props} />} />,
		<Route path="/wallet/" render={(props) => <Home {...props} />} />,
		<Route path="/search/:searchQuery?" render={(props) => <SearchPage {...props} />} />,
		<Route path="/podcast/:podcastPath/" render={(props) => <PodcastPage {...props} />} />,
		<Route path="/podcast/:podcastPath/:episodeId" render={(props) => <PodcastPage {...props} />} />,
		<Redirect exact from="/" to="home/" />
	].map((Route, index) => ({ ...Route, key: index }));

	return (
		<IonApp>
			<Player audioController={audioController} />
			<IonReactRouter>
				<IonSplitPane contentId="main" when={showSplitPane}>
					<MainMenu />
					<IonRouterOutlet id="main">
						{routes}
					</IonRouterOutlet>
					
				</IonSplitPane>
			</IonReactRouter>
		</IonApp>
	);
}