import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonBackButton, IonButton, IonIcon, IonModal, IonLabel } from "@ionic/react";

import { useRef, useState, useEffect } from 'react';

import AccountModal from "components/AccountModal/AccountModal";

import useBreakpoint from 'use-breakpoint';

import BottomMenu from "components/BottomMenu/BottomMenu";

import { BREAKPOINTS } from 'constants/breakpoints';

import {useHistory,useLocation} from "react-router";

import { personCircleOutline as notLoggedInIcon, personCircleSharp as loggedInIcon } from 'ionicons/icons';

import useStore from 'store/Store';

const Page = ({ id = null, title = "Undefined", defaultHeader = true, showBackButton = true, className = "", children, contentRef = null }) => {
	const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, 'desktop');
	const location = useLocation();
	const history = useHistory();

	const showBottomMenu = breakpoint !== 'desktop';

	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);

	const random = Math.random();
	const modalString = "open-account-modal-" + random;

	return (
		<IonPage id={id} className={className}>
			<IonHeader translucent="false" className="mainHeader">
				<IonToolbar className="mainToolbar">
					<IonButtons slot="start" className="ionButtons">
						{ showBackButton &&
							<IonBackButton defaultHref={'/home/'} />
						}
					</IonButtons>
					<IonTitle>{title}</IonTitle>
					<IonButtons slot="end" className="ionButtons">
						<IonButton id={modalString}>
							{ (false && loggedIn) &&
								<IonLabel style={{ maxWidth: 90 }}>{userData.username}</IonLabel>
							}
							{ loggedIn &&
								<IonIcon slot="icon-only" icon={loggedInIcon} expand="block"></IonIcon>
							}
							{ !loggedIn &&
								<IonIcon slot="icon-only" icon={notLoggedInIcon} expand="block"></IonIcon>
							}
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent id="main" forceOverscroll={true} ref={contentRef}>
				{ defaultHeader &&
					<IonHeader collapse="condense" class="mainTitleHeader">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				}

				{children}
				{ /* <div className="playerPagePadding" style={{ height: 60 }}></div> */ }
				<AccountModal trigger={modalString} />
			</IonContent>
			{ showBottomMenu &&
				<BottomMenu />
			}
		</IonPage>
	);
};
export default Page;