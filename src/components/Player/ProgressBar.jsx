import React, { useState, useEffect } from 'react';
import { IonRange } from '@ionic/react';

import TimeUtil from 'library/TimeUtil';

const ProgressBarSlider = ({ progress, duration, onProgressSliderChange}) => {
	var sliderInitial = (100 * progress) / duration;
	if (sliderInitial < 0) {
		sliderInitial = 0;
	}
	else if (sliderInitial > 100) {
		sliderInitial = 100;
	}

	const [sliderValue,setSliderValue] = useState(sliderInitial);
	const [dragValue,setDragValue] = useState(false);
	const [useDragValue,setUseDragValue] = useState(sliderValue);

	const [isDraggingSlider,setIsDraggingSlider] = useState(false);


	useEffect(() => {
		let newValue = (100 * progress) / duration;

		if (isDraggingSlider) {
			newValue = dragValue;
		}
		if (newValue < 0) {
			newValue = 0;
		}
		else if (newValue > 100) {
			newValue = 100;
		}
		setSliderValue(newValue);
	},[progress,duration,dragValue,isDraggingSlider]);

	const sliderDragged = ({ detail }) => {
		if (isDraggingSlider) {
			console.log('dragging: ' + detail.value);
			setDragValue(detail.value);
		}
	};

	const sliderDragStart = ({ detail }) => {
		setIsDraggingSlider(true);
		console.log('drag start');
		console.log(detail.value);
	}
	const sliderDragStopped = ({ detail }) => {
		setIsDraggingSlider(false);

		console.log('drag end');
		console.log(detail.value);
		var value = detail.value;

		if (value < 0) {
			value = 0;
		}
		else if (value > 100) {
			value = 100;
		}

		onProgressSliderChange(value,false);
		setSliderValue(value);
	};

	return (
		<IonRange
			value={sliderValue}
			onIonChange={sliderDragged}
			onIonKnobMoveStart={sliderDragStart}
			onIonKnobMoveEnd={sliderDragStopped}
			pin={true}
			pinFormatter={(number) => { return TimeUtil.formatPrettyDurationText((sliderValue * duration) / 100) }}
		>
		</IonRange>
	);
/*
	return (
		<IonRange
			step={0.1}
			values={[sliderValue]}
			min={0}
			max={100}
			renderTrack={({ props, children }) => (
				<div
					onMouseDown={(event) => { console.log('onMouseDown'); setIsDraggingSlider(true); props.onMouseDown(event); }}
					onTouchStart={(event) => { console.log('touchstart'); setIsDraggingSlider(true); props.onTouchStart(event); }}
					style={{
						...props.style,
						height: fullPlayerOpen ? '36px' : '24px',
						width: '100%',
						display: 'flex'
					}}
				>
					<div
						ref={props.ref}
						style={{
							height: '6px',
							width: '100%',
							borderRadius: '3px',
							alignSelf: 'center',
							background: getTrackBackground({
								values: [sliderValue],
								colors: ['#29bd73', 'rgba(10, 10, 0, 0.5)'],
								min: 0,
								max: 100
							})
						}}
					>
						{children}
					</div>
				</div>
			)}
			renderThumb={({ props, isDragged }) => (
				<div
					{...props}
					style={{
						...props.style,
						height: '16px',
						width: '16px',
						borderRadius: '50%',
						backgroundColor: '#FFFFFF',
						transition: 'all 0.3s',
						boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)'
					}}
				>
					{ isDraggingSlider &&
						<div
							className={styles.timePreview}
						>
							{TimeUtil.formatPrettyDurationText((sliderValue * duration) / 100)}
						</div>
					}
				</div>
			)}
			onChange={sliderDragged}
			onFinalChange={sliderDragStopped}
		/>
	);
*/
};

export default ProgressBarSlider;