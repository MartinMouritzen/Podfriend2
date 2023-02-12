import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonBackButton, IonButton, IonIcon, IonModal } from "@ionic/react";

import { useRef, useState, useEffect } from 'react';

import AccountModal from "components/AccountModal/AccountModal";

import useBreakpoint from 'use-breakpoint';

import BottomMenu from "components/BottomMenu/BottomMenu";

import { BREAKPOINTS } from 'constants/breakpoints';

import {useHistory,useLocation} from "react-router";

import { personCircle } from 'ionicons/icons';


const Page = ({ id = null, title = "Undefined", defaultHeader = true, showBackButton = true, children }) => {
	const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, 'desktop');
	const location = useLocation();
	const history = useHistory();

	const showBottomMenu = breakpoint !== 'desktop';

	return (
		<IonPage id={id}>
			<IonHeader translucent="false" className="mainHeader">
				<IonToolbar>
					<IonButtons slot="start" className="ionButtons">
						{ showBackButton &&
							<IonBackButton defaultHref={'/home/'} />
						}
					</IonButtons>
					<IonTitle>{title}</IonTitle>
					<IonButtons slot="end" className="ionButtons">
						<IonButton id="open-modal">
							<IonIcon slot="icon-only" icon={personCircle} expand="block"></IonIcon>
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent id="main" forceOverscroll={true}>
				{ defaultHeader &&
					<IonHeader collapse="condense" class="mainTitleHeader">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				}

				{children}
				<div className="playerPagePadding" style={{ height: 60 }}></div>
				<AccountModal trigger="open-modal" />
			</IonContent>
			{ showBottomMenu &&
				<BottomMenu />
			}
		</IonPage>
	);
};
export default Page;