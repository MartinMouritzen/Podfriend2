import { useEffect, useRef, useState } from 'react';

import { Capacitor } from '@capacitor/core';

import { MemoryRouter as Router, Routes, Route, Redirect } from 'react-router-dom';
import './App.scss';

import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, IonMenu, IonTabs, IonTab, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge, IonGrid, IonRow, IonHeader, IonToolbar } from '@ionic/react';
import { IonReactRouter, IonReactHashRouter } from '@ionic/react-router';

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
import EpisodePage from 'pages/PodcastPage/EpisodePage';
import SearchPage from 'pages/SearchPage/SearchPage';
import WalletPage from 'pages/WalletPage/WalletPage';
import WalletHistoryPage from 'pages/WalletPage/WalletHistoryPage';
import CategoryPage from 'pages/CategoryPage/CategoryPage';
import ReviewPage from 'pages/ReviewPage/ReviewPage';

import useStore from 'store/Store';

import Player from 'components/Player/Player';

import { BREAKPOINTS } from 'constants/breakpoints';
import DesktopPlayList from 'components/PlayList/DesktopPlaylist';
import DesktopHeader from 'components/WindowFrame/DesktopHeader';
import AccountModal from 'components/AccountModal/AccountModal';
import AlbyOauthPage from 'pages/WalletPage/AlbyOauthPage';
import ContactPage from 'pages/ContactPage/ContactPage';
import LoadingScreen from 'components/UI/LoadingScreen';

setupIonicReact({
	mode: 'ios',
	swipeBackEnabled: true

});

const capPlatform = Capacitor.getPlatform();

/* import MenuShadow from 'images/layout/menushadow.png'; */

export default function App({ platform, audioController, desktop = false }) {
	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const showSplitPane = breakpoint === 'desktop';

	const [readyToShow,setReadyToShow] = useState(false);

	const _hasHydrated = useStore((state) => state._hasHydrated);

	const loggedIn = useStore((state) => state.loggedIn);
	const setAudioController = useStore((state) => state.setAudioController);
	const setDesktop = useStore((state) => state.setDesktop);
	const synchronizePodcasts = useStore((state) => state.synchronizePodcasts);

	const authToken = useStore((state) => state.authToken);
	const authenticateUser = useStore((state) => state.authenticateUser);

	const walletSetupCompleted = useStore((state) => state.walletSetupCompleted);
	const doAlbyAuthTokenRefreshIfNeeded = useStore((state) => state.doAlbyAuthTokenRefreshIfNeeded);
	

	const RouterUsed = desktop ? IonReactHashRouter : capPlatform === 'web' ? IonReactRouter : IonReactHashRouter;

	useEffect(() => {
		setAudioController(audioController);
		setDesktop(desktop);
		console.log('App loaded');
	},[]);

	useEffect(() => {
		setReadyToShow(_hasHydrated);
	},[_hasHydrated]);

	useEffect(() => {
		if (_hasHydrated && loggedIn) {
			console.log('synchronizePodcasts();');
			synchronizePodcasts();
		}
	},[loggedIn,_hasHydrated]);

	const router = useRef(false);
	const navigateToPath = (path) => {
		if (router.current && router.current.history) {
			event.preventDefault();
			router.current.history.push(path);
		}

		return false;
	};

	useEffect(() => {
		if (_hasHydrated && authToken) {
			authenticateUser();

			if (walletSetupCompleted) {
				doAlbyAuthTokenRefreshIfNeeded();
			}
		}
	},[authToken,_hasHydrated]);

	const routes = [
		<Route path="/" exact={true} render={(props) => <Home {...props} />} />,
		<Route path="/contact/" render={(props) => <ContactPage {...props} />} />,
		<Route path="/discover/" render={(props) => <DiscoverPage {...props} />} />,
		<Route path="/favorites/" render={(props) => <FavoritePage {...props} />} />,
		<Route path="/playlist/" render={(props) => <Home {...props} />} />,
		<Route path="/collections/" render={(props) => <Home {...props} />} />,
		<Route path="/wallet/" exact={true} render={(props) => <WalletPage {...props} />} />,
		<Route path="/wallet/history/" exact={true}  render={(props) => <WalletHistoryPage {...props} />} />,
		<Route path="/oauth/alby" render={(props) => <AlbyOauthPage {...props} />} />,
		<Route path="/search/:searchQuery?" render={(props) => <SearchPage {...props} />} />,
		<Route exact={true} path="/podcast/:podcastPath/" render={(props) => <PodcastPage {...props} />} />,
		<Route exact={true} path="/podcast/:podcastPath/reviews/" render={(props) => <ReviewPage {...props} />} />,
		<Route exact={true} path="/podcast/:podcastPath/episode/:episodeId/" render={(props) => <EpisodePage audioController={audioController} navigateToPath={navigateToPath} {...props} />} />,
		<Route path="/categories/:categoryKey/" render={(props) => <CategoryPage {...props} />} />,
		<Redirect exact={true} from="/home/" to="/" />,
		<Redirect exact={true} from="/index.html" to="/" />
	].map((Route, index) => ({ ...Route, key: index }));

	return (
		<RouterUsed ref={router}>
			<IonApp className={'platform_' + platform}>
				{ !readyToShow &&
					<LoadingScreen />
				}
				{ readyToShow &&
					<>
						{ platform === 'desktop' &&
							<DesktopHeader />
						}
						<Player audioController={audioController} navigateToPath={navigateToPath} platform={platform} />
						<div className="menuShadow" style={{ display: 'none' }}>&nbsp;</div>
						
						<IonSplitPane contentId="main" when={showSplitPane}>
							<MainMenu />
							<IonRouterOutlet id="main">
								{routes}
							</IonRouterOutlet>
						</IonSplitPane>
						<AccountModal breakpoint={breakpoint} />
					</>
				}
				
			</IonApp>
		</RouterUsed>
	);
}