import { useState, useEffect, useRef } from 'react';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent, IonFooter, IonPage } from "@ionic/react";

import './onboarding.scss';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";


import { Pagination } from "swiper";

const OnboardingStep = ({ children, illustration, backgroundColor }) => {
	return (
		<div className="onboardingContent">
			<div className="onboardingImageContainer" style={{ backgroundColor: backgroundColor }}>
				<img src={illustration} />
			</div>
			<div className="onboardingText">
				{children}
			</div>
		</div>
	);
};
const Onboarding = ({ children, title, closeModal, skippable = "Close", lastButtonTitle = "Finish", lastButtonFunction = false, hideLastContinueButton = false }) => {
	const [swiperInstance, setSwiperInstance] = useState(null);
	const [step,setStep] = useState(0);

	const nextStep = () => {
		swiperInstance.slideNext();
		/*
		if (!swiperInstance.isEnd) {
			swiperInstance.slideTo(swiperInstance.activeIndex + 1);
		}
		*/
	};
	const prevStep = () => {
		swiperInstance.slidePrev();
	};
	const getActiveStepTitle = (children) => {
		if (swiperInstance) {
			return children[swiperInstance.activeIndex].props.title
		}
	};
	const onSlideChanged = () => {
		setStep(swiperInstance.activeIndex);
	}

	return (
		<IonPage>
			<IonHeader className="ion-no-border">
				<IonToolbar>
					{ step !== 0 &&
						<IonButtons slot="start">
							<IonButton onClick={prevStep}>Back</IonButton>
						</IonButtons>
					}
					<IonTitle>{getActiveStepTitle(children)}</IonTitle>
					{ skippable !== false &&
						<IonButtons slot="end">
							<IonButton onClick={closeModal}>{skippable}</IonButton>
						</IonButtons>
					}
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<Swiper
					onSwiper={(swiper) => setSwiperInstance(swiper)}
					onSlideChange={onSlideChanged}
					slidesPerView={1}
					slidesPerGroup={1}
					spaceBetween={0}
					slidesOffsetBefore={0}
					slidesOffsetAfter={0}
					pagination={{
						clickable: true,
					}}
					modules={[Pagination]}

			className="onboardingSwiper"
				>
					{children && children.map((content,index) => {
						return (
							<SwiperSlide key={'onboardingstep_' + index}>
								{content}
							</SwiperSlide>
						);
					} ) }
				</Swiper>
			{/*
				<div className="onboardingScreen">
					{ children && children.map((child) => {
						console.log(child);
						if (child.props.step === step) {
							return child;
						}
					} )	}
					<div className="steps">
						{ Array.apply(null, { length: numberOfSteps }).map((e, i) => (
							<div className={'step ' + (i === step - 1 ? 'active' : '')}>&nbsp;</div>
						)) }
					</div>
				</div>
			*/ }
			</IonContent>
			
				<IonFooter className="ion-no-border">
					<IonToolbar>
						{ (lastButtonTitle && swiperInstance && swiperInstance.isEnd) && 
							<>
								<IonButton expand='block' onClick={lastButtonFunction}>{lastButtonTitle}</IonButton>
							</>
						}
						{ (!lastButtonTitle && !hideLastContinueButton && swiperInstance && swiperInstance.isEnd) &&
							<IonButton expand='block' onClick={closeModal}>Finish</IonButton>
						}
						{ (swiperInstance && !swiperInstance.isEnd) &&
							<IonButton expand='block' onClick={nextStep}>Continue</IonButton>
						}
					</IonToolbar>
				</IonFooter>
		</IonPage>
	);
};
export { Onboarding, OnboardingStep };