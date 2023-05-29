// import { useState } from 'react';

import { IonSpinner } from "@ionic/react";

import PodfriendLogo from 'images/icons/podfriend_logo.svg';

const LoadingScreen = ({ hasLoaded }) => {
	return (
		<div className={'loadingScreen ' + (hasLoaded ? 'loadingScreenLoaded' : '')} style={{ position: 'absolute', zIndex: 2000, top: 0, left: 0, width: '100%', height: '100%', flex: 1, backgroundColor: 'var(--primary-color)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFFFFF', flexDirection: 'column', gap: 40 }}>
			
			<img src={PodfriendLogo} style={{ maxWidth: 400, maxHeight: 400, marginLeft: 20, marginRight: 20 }} />
			<IonSpinner  name="circular" />
			<div style={{ fontSize: 20, marginLeft: 20, marginRight: 20, textAlign: 'center' }}>Preparing your Podcast Listening experience</div>
		</div>
	);
};
export default LoadingScreen;