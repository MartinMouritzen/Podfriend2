import { IonSpinner } from "@ionic/react";

import PodfriendLogo from 'images/icons/podfriend_logo.svg';

const LoadingScreen = () => {
	return (
		<div style={{ flex: 1, backgroundColor: 'var(--primary-color)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFFFFF', flexDirection: 'column', gap: 40 }}>
			
			<img src={PodfriendLogo} style={{ maxWidth: 400, maxHeight: 400 }} />
			<div>Loading</div>
		</div>
	);
};
export default LoadingScreen;