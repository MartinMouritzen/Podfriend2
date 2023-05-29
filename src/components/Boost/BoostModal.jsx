import useStore from 'store/Store';

import { useState } from 'react';
import { useReward } from 'react-rewards';

import {
	rocketOutline as boostIcon,
	settings as configIcon
} from 'ionicons/icons';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent, IonFooter, IonPage, IonInput, IonTextarea, IonSpinner } from "@ionic/react";

import { useReward } from 'react-rewards';

const BoostModal = ({ onDismiss }) => {
	const userData = useStore((state) => state.userData);
	const boostValue = useStore((state) => state.boostValue);
	const activePodcast = useStore((state) => state.activePodcast);
	const isBoosting = useStore((state) => state.isBoosting);
	const defaultBoostAmount = useStore((state) => state.defaultBoostAmount);

	const [boostAmount,setBoostAmount] = useState(defaultBoostAmount);
	const [name,setName] = useState(userData.username ? userData.username : '');
	const [message,setMessage] = useState('');

	const onNameChange = (event) => {
		setName(event.detail.value);
	};
	const onBoostChange = (event) => {
		setBoostAmount(event.detail.value);
	};
	const onMessageChange = (event) => {
		setMessage(event.detail.value);
	};

	const onBoost = () => {
		// console.log('onBoost');
		boostValue(activePodcast.value,boostAmount,false,name,message)
		.then((result) => {
			console.log(result);
			reward();
		})
		.catch((exception) => {
			console.log('Exception while boosting');
			console.log(exception);
		});
	};

	const { reward, isAnimating } = useReward(
		'rewardButton',
		'confetti',
		{
			startVelocity: 45,
			lifetime: 200,
			elementCount: 50
		}
	);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Boostagram to {activePodcast.name}</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="greyPage">
				<IonList inset={true}>
				<IonItem>
						<IonLabel position="floating">Boost amount</IonLabel>
						<IonInput onIonChange={onBoostChange} value={boostAmount} type="number" />
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Your name</IonLabel>
						<IonInput onIonChange={onNameChange} autoCapitalize={true} autocomplete='name' enterkeyhint="next" value={name} />
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Your message</IonLabel>
						<IonTextarea autoGrow={true} value={message} onIonChange={onMessageChange} />
					</IonItem>
				</IonList>
				<div className="ion-padding" id="rewardButton">
				<IonButton expand="block" onClick={onBoost}>
						{ isBoosting &&
							<>
								<IonSpinner /> Boosting {Number(boostAmount).toLocaleString()}
							</>
						}
						{ !isBoosting &&
							<>
								<IonIcon icon={boostIcon} slot="start" />
								Boost {Number(boostAmount).toLocaleString()}
							</>
						}
					</IonButton>

				</div>
			</IonContent>
		</IonPage>
	);
};
export default BoostModal;