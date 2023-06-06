import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonBackButton, IonButton, IonIcon, IonModal, IonLabel, IonRefresher, IonRefresherContent } from "@ionic/react";

import { useRef, useState, useEffect, useCallback } from 'react';

import useBreakpoint from 'use-breakpoint';

import BottomMenu from "components/BottomMenu/BottomMenu";

import { BREAKPOINTS } from 'constants/breakpoints';

import { useLocation } from "react-router";

import { personCircleOutline as notLoggedInIcon, personCircleSharp as loggedInIcon } from 'ionicons/icons';

import useStore from 'store/Store';

function useHookWithRefCallback(setScrollableContentRef = false) {
	const ref = useRef(null);
	const setRef = useCallback((node) => {
		if (ref.current) {
			// Make sure to cleanup any events/references added to the last instance
			

		}

		if (node) {
			if (setScrollableContentRef) {
				setScrollableContentRef(node);
				// node.scrollToTop();
			}

			var styles = node.shadowRoot.querySelectorAll(".customScrollStyle");

			if (styles.length === 0) {
				let el = document.createElement('style')
				el.className = "customScrollStyle";
				el.textContent = `::-webkit-scrollbar {
					width: 8px;
					height: 6px;
					}
					::-webkit-scrollbar-track {
						background-color: transparent;
					}
					::-webkit-scrollbar-thumb {
						background-color: #cacaca;
						border-radius: 8px;
					}
					
					::-webkit-scrollbar-thumb:hover {
						background-color: #aaa;
					}
					.inner-scroll {
						scrollbar-width: thin
						scrollbar-color: #cacaca transparent;
					}
					::-webkit-scrollbar-track-piece:end {
						margin-bottom: 60px;
					}
					@media (min-width: 670px) {
						::-webkit-scrollbar-track-piece:end {
							margin-bottom: 90px !important;
						}
					}`;
				node.shadowRoot.appendChild(el);
			}
			// console.log(node.shadowRoot);

			// Check if a node is actually passed. Otherwise node would be null.
		// You can now do what you need to, addEventListeners, measure, etc.
		}

		// Save a reference to the node
		ref.current = node;
	}, [])
	return [setRef]
}

const Page = ({ id = null, title = "Undefined", defaultHeader = true, defaultHref = '/', showBackButton = true, backButtonText = "back", className = "", children, setScrollableContentRef = false, onRefresh = false, setCurrentPage = false}) => {
	const { breakpoint, maxWidth, minWidth } = useBreakpoint(BREAKPOINTS, 'desktop');
	const location = useLocation();

	if (location.state && location.state.backButtonText) {
		if (backButtonText === 'back') {
			backButtonText = location.state.backButtonText;
		}
	}

	const showBottomMenu = breakpoint !== 'desktop';

	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);
	const setShowingLoginModal = useStore((state) => state.setShowingLoginModal);

	const random = Math.random();
	// const modalString = "open-account-modal-" + random;
	const modalString = "open-account-modal";
	const [ contentNodeRef ] = useHookWithRefCallback(setScrollableContentRef);

	const ionPageRef = useRef(null);

	/*
	useEffect(() => {
		if (contentRef && contentRef.current) {
			contentRef.current.getScrollElement()
			.then((scrollElement) => {
				console.log(scrollElement.tagName);
				console.log(scrollElement);
				console.log(scrollElement.nativeElement);

				let el = document.createElement('style')
				el.innerText = getStyle();
				scrollElement.appendChild(el);
			});
		}
	},[contentRef.current]);
	*/

	return (
		<IonPage id={id} className={className} ref={ionPageRef}>
			<IonHeader translucent={false} className="mainHeader">
				<IonToolbar className="mainToolbar">
					<IonButtons slot="start" className="ionButtons">
						{ showBackButton &&
							<IonBackButton defaultHref={defaultHref} text={breakpoint === 'desktop' ? backButtonText : 'Back'} />
						}
					</IonButtons>
					<IonTitle>{title}</IonTitle>
					<IonButtons slot="end" className="ionButtons">
						<IonButton onClick={() => { setShowingLoginModal(true); }}>
							{ loggedIn &&
								<IonLabel className="userNameLabel">{userData.username}</IonLabel>
							}
							{ !loggedIn &&
								<IonLabel className="userNameLabel">Log in</IonLabel>
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
			<IonContent fullscreen={false} id="main" forceOverscroll={false} ref={contentNodeRef}>
				{ defaultHeader &&
					<IonHeader collapse="condense" className="mainTitleHeader">
						<IonToolbar>
							<IonTitle size="large">{title}</IonTitle>
						</IonToolbar>
					</IonHeader>
				}
				{ (onRefresh !== false) &&
					<IonRefresher slot="fixed" onIonRefresh={onRefresh}>
						<IonRefresherContent>
						</IonRefresherContent>
					</IonRefresher>
				}
				{children}
				<div className="playerPagePadding" style={{ height: 90 }}></div>
			</IonContent>
			{ showBottomMenu &&
				<BottomMenu />
			}
		</IonPage>
	);
};
export default Page;