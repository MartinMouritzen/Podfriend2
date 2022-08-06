import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact, IonMenu } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import WindowFrame from 'components/WindowFrame/WindowFrame';

import Home from 'pages/Home/Home';

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

setupIonicReact();

export default function App({ platform }) {
	return (
		<IonApp>
			<WindowFrame>
				<IonSplitPane contentId="main" when="(min-width: 475px)">
					<IonMenu contentId="main" side="start" type="push">
						test
					</IonMenu>
					<IonReactRouter>
						
							<IonRouterOutlet id="main">
								<Route path="/" component={Home} />
							</IonRouterOutlet>
						
					</IonReactRouter>
				</IonSplitPane>
			</WindowFrame>
		</IonApp>
	);
}