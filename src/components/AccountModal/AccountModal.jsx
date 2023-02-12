import { useRef, useState, useEffect } from "react";

import { IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonNav } from "@ionic/react";
import LoginIndex from "./LoginIndex";

import './AccountModal.scss'

const AccountModal = ({ trigger, canDismiss = true }) => {

	const page = useRef(null);
	const modal = useRef(null);
	const [presentingElement, setPresentingElement] = useState(null);

	const isLoggedIn = false;
	
	useEffect(() => {
		setPresentingElement(page.current);
	}, []);

	const dismiss = () => {
		modal.current?.dismiss();
	}

	return (
		<IonModal ref={modal} trigger={trigger} presentingElement={presentingElement} canDismiss={canDismiss}>
			{ isLoggedIn &&
				<IonHeader>
					<IonToolbar>
						<IonTitle>Account</IonTitle>
						<IonButtons slot="end">
							<IonButton onClick={() => dismiss()}>Close</IonButton>
						</IonButtons>
					</IonToolbar>
				</IonHeader>
			}
			<IonNav root={() => <LoginIndex dismiss={dismiss} /> }>
				
			</IonNav>
		</IonModal>
	);
}
export default AccountModal;