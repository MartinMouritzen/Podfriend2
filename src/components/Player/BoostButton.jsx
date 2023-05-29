import {
	rocketOutline as boostIcon,
	settings as configIcon
} from 'ionicons/icons';

import useStore from 'store/Store';

import { useState } from 'react';
import { useReward } from 'react-rewards';

import { useLongPress } from 'use-long-press';

import { IonButton, IonIcon, IonSpinner, useIonActionSheet, useIonModal } from '@ionic/react';

import { BREAKPOINTS } from 'constants/breakpoints';
import useBreakpoint from 'use-breakpoint';

import './BoostButton.scss';
import BoostModal from 'components/Boost/BoostModal';
import BoostSettingsModal from 'components/Boost/BoostSettingsModal';

const BoostButton = () => {
	const boostAmount = 500;

	const isBoosting = useStore((state) => state.isBoosting);
	const userData = useStore((state) => state.userData);

	const boostValue = useStore((state) => state.boostValue);
	const activePodcast = useStore((state) => state.activePodcast);

	const defaultBoostAmount = useStore((state) => state.defaultBoostAmount);

	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const onBoost = () => {
		// valueBlock,totalAmount,overrideDestinations = false,senderName = false,message = false
		boostValue(activePodcast.value,defaultBoostAmount,false,userData.username)
		.then((result) => {
			console.log(result);
			reward();
		})
		.catch((exception) => {
			console.log('Exception while boosting');
			console.log(exception);
		});
	};
	const longPressBind = useLongPress(() => {
		openBoostModal();
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

	const [present, dismiss] = useIonModal(BoostModal, {
		onDismiss: (data, role) => dismiss(data, role),
	});
	const [boostSettingsPresent, boostSettingsDismiss] = useIonModal(BoostSettingsModal, {
		onDismiss: (data, role) => boostSettingsDismiss(data, role),
	});

	const openBoostModal = () => {
		present({
			backdropBreakpoint: 0.3,
			backdropDismiss: true,
			initialBreakpoint: breakpoint === 'desktop' ? undefined : 0.5,
			breakpoints: breakpoint === 'desktop' ? undefined : [0,0.5,1],
			canDismiss: true,
			onWillDismiss: (event) => {
			  
			},
		});
	};

	const onConfigure = () => {
		boostSettingsPresent({
			backdropBreakpoint: 0.3,
			backdropDismiss: true,
			initialBreakpoint: breakpoint === 'desktop' ? undefined : 0.4,
			breakpoints: breakpoint === 'desktop' ? undefined : [0,0.4,1],
			canDismiss: true,
			onWillDismiss: (event) => {
			  
			},
		});
	};

	return (
		<div className="boostButtonContainer">
			<div className="boostButtonDiv">
				<div id="rewardButton">
					<div className="boostButton">
						<div className="buttonPrimaryAction" onClick={openBoostModal} onMouseDown={onBoostDown} onMouseUp={onBoostUp} onTouchStart={onBoostDown} onTouchEnd={onBoostUp}>
							{ isBoosting &&
								<>
									<IonSpinner /> Boosting
								</>
							}
							{ !isBoosting &&
								<>
										<IonIcon icon={boostIcon} slot="start" />
									Boost {defaultBoostAmount.toLocaleString()}
								</>
							}
						</div>
						<div className="buttonSecondaryAction" onClick={onConfigure}>
							<IonIcon icon={configIcon} className="configIcon" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default BoostButton;