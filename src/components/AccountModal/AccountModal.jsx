import { useRef, useState, useEffect } from "react";

import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonNav, useIonModal, IonPage } from "@ionic/react";
import LoginIndex from "./LoginIndex";

import useStore from 'store/Store';

import './AccountModal.scss'
import AccountModalPage from "./AccountModalPage";

const AccountModal = ({ breakpoint }) => {
	const page = useRef(null);
	const modal = useRef(null);
	const [presentingElement, setPresentingElement] = useState(null);

	const showingLoginModal = useStore((state) => state.showingLoginModal);
	const setShowingLoginModal = useStore((state) => state.setShowingLoginModal);
	
	useEffect(() => {
		setPresentingElement(page.current);
	}, []);

	// console.log(loggedIn + ':' + creatingUser);
	const [accountModalPresent, accountModalDismiss] = useIonModal(AccountModalInner, {
		dismiss: (data,role) => { accountModalDismiss(data, role); },
	});

	useEffect(() => {
		if (showingLoginModal) {
			openModal();
		}
		else {
			closeModal();
		}
	},[showingLoginModal]);

	const closeModal = () => {
		accountModalDismiss();
	};
	const openModal = () => {
		accountModalPresent({
			backdropBreakpoint: 0.5,
			backdropDismiss: true,
			initialBreakpoint: breakpoint === 'desktop' ? undefined : 1,
			breakpoints: breakpoint === 'desktop' ? undefined : [0,1],
			canDismiss: true,
			
			onDidDismiss: (event) => {
				// setShowingLoginModal(false);
			},
			onWillDismiss: (event) => {
				setShowingLoginModal(false);
			},
		});
	}
	return null;
}
const AccountModalInner = ({ dismiss } ) => {
	const loggedIn = useStore((state) => state.loggedIn);

	const [creatingUser,setCreatingUser] = useState(false);

	useEffect(() => {
		setCreatingUser(loggedIn === false);
	},[loggedIn]);


	const onDismiss = () => {
		if (loggedIn) {
			setCreatingUser(false);
		}
	};

	return (
		<IonPage>
			{ (loggedIn && !creatingUser) &&
				<IonHeader>
					<IonToolbar>
						<IonTitle>Account</IonTitle>
						<IonButtons slot="end">
							<IonButton onClick={() => dismiss()}>Close</IonButton>
						</IonButtons>
					</IonToolbar>
				</IonHeader>
			}
			{ (!loggedIn || creatingUser) &&
				<IonNav root={() => <LoginIndex dismiss={dismiss} /> }>
					
				</IonNav>
			}
			{ (loggedIn && !creatingUser) &&
				<AccountModalPage dismiss={dismiss} />
			}
		</IonPage>
	);
}
export default AccountModal;