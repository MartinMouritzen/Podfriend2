import {
	rocketOutline as boostIcon,
	settings as configIcon
} from 'ionicons/icons';

import useStore from 'store/Store';

import { useState } from 'react';
import { useReward } from 'react-rewards';

import { useLongPress } from 'use-long-press';

import { IonButton, IonIcon, IonSpinner, useIonActionSheet, useIonModal } from '@ionic/react';

import './BoostButton.scss';

const BoostButton = () => {
	const boostAmount = 500;
	const [isBoosting,setIsBoosting] = useState(false);

	const boostValue = useStore((state) => state.boostValue);
	const activePodcast = useStore((state) => state.activePodcast);

	const onBoost = () => {
		setIsBoosting(true);

		// valueBlock,totalAmount,overrideDestinations = false,senderName = false,message = false
		boostValue(activePodcast.value,10,false,"Martin")
		.then((result) => {
			console.log(result);
			reward();
			setIsBoosting(false);
		})
		.catch((exception) => {
			console.log('Exception while boosting');
			console.log(exception);
			setIsBoosting(false);
		});
	};
	const longPressBind = useLongPress(() => {
		console.log('Long pressed!');
	},{
		threshold: 400
	});

	const { reward, isAnimating } = useReward(
		'rewardButton',
		'confetti',
		{
			startVelocity: 45,
			lifetime: 200,
			elementCount: 50
		}
	);

	const onBoostDown = () => {

	};

	const onBoostUp = () => {

	};

	return (
		<div className="boostButtonContainer">
			<div className="filler">
				&nbsp;
			</div>
			<div className="boostButtonDiv">
				<div id="rewardButton">
					<div className="boostButton">
						<div className="buttonPrimaryAction" onClick={onBoost} {...longPressBind()} onMouseDown={onBoostDown} onMouseUp={onBoostUp} onTouchStart={onBoostDown} onTouchEnd={onBoostUp}>
							{ isBoosting &&
								<>
									<IonSpinner /> Boosting
								</>
							}
							{ !isBoosting &&
								<>
									<IonIcon icon={boostIcon} slot="start" />
									Boost
								</>
							}
						</div>
						<div className="buttonSecondaryAction">
							<IonIcon icon={configIcon} className="configIcon" />
						</div>
					</div>
				</div>
				<div className="infoMessage">
					Hold to send a Boostagram
				</div>
			</div>
			<div>
				
			</div>
		</div>
	);
};
export default BoostButton;