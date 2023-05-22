import React, { useState, useEffect } from 'react';

import useStore from 'store/Store';

import { IonRange, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonModal, IonModal, IonPage, IonButton, IonContent } from "@ionic/react";

import './AudioSpeedSettingModal.scss';

import { setAudioPlaybackSpeed } from 'podfriend-approot/redux/actions/settingsActions';

const AudioSpeedSettingModal = ({ onDismiss }) => {
	const speedButtons = [0.75,1.0,1.25,1.5];

	const playbackSpeed = useStore((state) => state.playbackSpeed);	
	const setPlaybackSpeed = useStore((state) => state.setPlaybackSpeed);	

	const map_range = (value, low1, high1, low2, high2) => {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}

	var sliderInitial = Number.parseInt(map_range(playbackSpeed,0.7,3,0,100));

	if (sliderInitial < 0) {
		sliderInitial = 0;
	}
	else if (sliderInitial > 100) {
		sliderInitial = 100;
	}

	const [sliderValue,setSliderValue] = useState(sliderInitial);
	const [isDraggingSlider,setIsDraggingSlider] = useState(false);
	const [dragValue,setDragValue] = useState(false);

	const onSpeedChange = (value) => {
		var scaledValue = Number.parseFloat(map_range(value,0,100,0.7,3.0)).toFixed(2);
		saveAudioSpeed(scaledValue);
	};
	const saveAudioSpeed = (value) => {
		if (isNaN(value)) {
			return;
		}
// 		console.log('setting audio speed: ' + value + ' (' + dragValue + ',' + sliderValue + ',' + isDraggingSlider + ')');
		setPlaybackSpeed(value);
	};


	useEffect(() => {
		var sliderInitial = Number.parseInt(map_range(playbackSpeed,0.7,3,0,100));

		if (sliderInitial < 0) {
			sliderInitial = 0;
		}
		else if (sliderInitial > 100) {
			sliderInitial = 100;
		}
		setSliderValue(sliderInitial);

	},[playbackSpeed]);
	useEffect(() => {
		// var newValue = sliderValue;

		if (isDraggingSlider) {
			var newValue = dragValue;
			if (newValue === false) {
				return;
			}
			
			if (newValue < 0) {
				newValue = 0;
			}
			else if (newValue > 100) {
				newValue = 100;
			}
			setSliderValue(newValue);
			onSpeedChange(sliderValue);
		}
	},[dragValue,isDraggingSlider]);

	const sliderDragged = ({ detail }) => {
		if (isDraggingSlider) {
			setDragValue(detail.value);
		}
	};

	const sliderDragStart = ({ detail }) => {
		setIsDraggingSlider(true);
	}

	const sliderDragStopped = ({ detail }) => {
		setIsDraggingSlider(false);

		// console.log('drag end');
		// console.log(detail.value);
		var value = detail.value;

		if (value < 0) {
			value = 0;
		}
		else if (value > 100) {
			value = 100;
		}

		setSliderValue(value);
		onSpeedChange(sliderValue);
	};

	const percentage = Number.parseInt(map_range(playbackSpeed,0.7,3,0,100));

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Audio speed</IonTitle>
					<IonButtons slot="end">
						<IonButton onClick={onDismiss}>Close</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div className='audioSpeedSettingModal'>
					<div>
						<h2>{playbackSpeed}x</h2>
						<div>Current speed</div>
					</div>
					<div className='speedRange'>
						<div>0.7x</div>

						<IonRange
							value={sliderValue}
							onIonChange={sliderDragged}
							onIonKnobMoveStart={sliderDragStart}
							onIonKnobMoveEnd={sliderDragStopped}
						>
						</IonRange>

						<div>3x</div>
					</div>
					<div className='speedButtons'>
						<div className='speedButtonsTitle'>
							Shortcuts
						</div>
						{ speedButtons.map((speed) => {
							return (
								<IonButton style={{ width: '70px' }} key={speed} fill={(Number.parseFloat(speed) === Number.parseFloat(playbackSpeed) ? 'solid' : 'outline')} onClick={() => { saveAudioSpeed(speed); }}>{speed}x</IonButton>
							);
						}) }
					</div>
				</div>
			</IonContent>
		</IonPage>
		
	);
};

export default AudioSpeedSettingModal;