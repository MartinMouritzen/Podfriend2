import Page from "components/Page/Page";

import { useRef, useEffect, useState } from 'react';

import useStore from 'store/Store';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonTitle, IonToolbar, useIonModal } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon,
	helpCircleOutline as helpIcon,
	alertCircleOutline as noticeIcon
} from 'ionicons/icons';

const ImportPage = ({  }) => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);

	return (
		<Page id="import" title="Import podcasts">
			<div className="ion-padding" style={{ maxWidth: 700 }}>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce lobortis nulla in augue imperdiet, ullamcorper facilisis nibh convallis. Vestibulum vitae efficitur augue, nec consectetur lectus. Integer sit amet sollicitudin dolor. Mauris sem lacus, pretium sed posuere feugiat, condimentum ut sem. Quisque vel fringilla sapien. Etiam et velit ut arcu elementum varius eget quis risus. Ut quis sodales nisi. Maecenas eros ligula, semper in urna ac, sagittis porta urna. In et erat sit amet ipsum malesuada faucibus. Fusce enim ante, fermentum vel auctor sed, dapibus quis risus.
				</p>
			</div>
			
		</Page>
	);
};
export default ImportPage;