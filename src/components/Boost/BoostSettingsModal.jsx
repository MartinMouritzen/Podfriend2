import useStore from 'store/Store';

import { useState } from 'react';
import { useReward } from 'react-rewards';

import {
	rocketOutline as boostIcon,
	settings as configIcon
} from 'ionicons/icons';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent, IonFooter, IonPage, IonInput, IonTextarea, IonSpinner } from "@ionic/react";

const BoostSettingsModal = ({ onDismiss }) => {
	const userData = useStore((state) => state.userData);
	const activePodcast = useStore((state) => state.activePodcast);

	const defaultStreamAmount = useStore((state) => state.defaultStreamAmount);
	const defaultBoostAmount = useStore((state) => state.defaultBoostAmount);

	const setDefaultStreamAmount = useStore((state) => state.setDefaultStreamAmount);
	const setDefaultBoostAmount = useStore((state) => state.setDefaultBoostAmount);
	
	const [newBoostAmount,setNewBoostAmount] = useState(defaultBoostAmount);
	const [newStreamAmount,setNewStreamAmount] = useState(defaultStreamAmount);

	const onDefaultBoostChange = (event) => {
		setNewBoostAmount(event.detail.value);
	};
	const onDefaultStreamChange = (event) => {
		setNewStreamAmount(event.detail.value);
	};

	const saveConfig = () => {
		setDefaultBoostAmount(newBoostAmount);
		setDefaultStreamAmount(newStreamAmount);
	};


	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Boost and Streaming settings</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="greyPage">
				<IonList inset={true}>
				<IonItem>
						<IonLabel position="floating">Default Boost amount</IonLabel>
						<IonInput onIonChange={onDefaultBoostChange} value={newBoostAmount} type="number" />
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Stream amount per minute</IonLabel>
						<IonInput onIonChange={onDefaultStreamChange} value={newStreamAmount} type="number" />
					</IonItem>
				</IonList>
				<div className="ion-padding">
					<IonButton expand="block" onClick={saveConfig}>
						Save settings
					</IonButton>

				</div>
			</IonContent>
		</IonPage>
	);
};
export default BoostSettingsModal;