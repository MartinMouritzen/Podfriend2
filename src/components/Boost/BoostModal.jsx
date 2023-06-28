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
	const [currentEmoji,setCurrentEmoji] = useState('🦆');

	const onNameChange = (event) => {
		setName(event.detail.value);
	};
	const onBoostChange = (event) => {
		if (stringHasOnlyGivenCharType(event.detail.value,'2')) {
			setCurrentEmoji('🦆');
		}
		else {
			// setCurrentEmoji(false);
		}
		setBoostAmount(event.detail.value);
	};
	const onMessageChange = (event) => {
		setMessage(event.detail.value);
	};

	const stringHasOnlyGivenCharType = (str, char) => {
		const chars = Array.from(new Set(str.toString()))
		return !chars.some(c => c !== char) && !!chars.length 
	}

	const onBoost = () => {
		boostValue(activePodcast.value,boostAmount,false,name,message)
		// Promise.resolve()
		.then((result) => {
			if (stringHasOnlyGivenCharType(boostAmount,'2')) {
				duckReward();
			}
			else {
				confettiReward();
			}
		})
		.catch((exception) => {
			console.log('Exception while boosting');
			console.log(exception);
		});
	};

	const { reward: confettiReward, isAnimating: isAnimating } = useReward(
		'rewardContainer',
		'confetti',
		{
			startVelocity: 45,
			lifetime: 200,
			elementCount: 50,
			zIndex: 1000000
		}
	);

	const { reward: duckReward, isAnimating: isEmojiAnimating } = useReward('rewardContainer','emoji', { startVelocity: 45, lifetime: 200, elementCount: 50, zIndex: 1000000, emoji: [currentEmoji] } );

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Boostagram to {activePodcast.name}</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="greyPage" id="rewardButtonModal">
				<IonList inset={true}>
				<IonItem>
						<IonLabel position="floating">Boost amount</IonLabel>
						<IonInput onIonInput={onBoostChange} value={boostAmount} type="number" />
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Your name</IonLabel>
						<IonInput onIonInput={onNameChange} autoCapitalize={true} autocomplete='name' enterkeyhint="next" value={name} />
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Your message</IonLabel>
						<IonTextarea autoGrow={true} value={message} onIonInput={onMessageChange} />
					</IonItem>
				</IonList>
				<div className="ion-padding">
				<IonButton expand="block" onClick={onBoost}>
						{ isBoosting &&
							<>
								<IonSpinner /> Boosting {Number(boostAmount).toLocaleString()}
							</>
						}
						{ !isBoosting &&
							<>
								{ stringHasOnlyGivenCharType(boostAmount,'2') === false &&
									<IonIcon icon={boostIcon} slot="start" />
								}
								{ stringHasOnlyGivenCharType(boostAmount,'2') !== false &&
									<IonLabel slot="start" style={{ marginRight: 10 }}>{currentEmoji}</IonLabel>
								}
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