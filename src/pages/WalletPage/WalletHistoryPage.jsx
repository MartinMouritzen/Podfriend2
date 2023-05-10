import Page from "components/Page/Page";

import { useRef, useEffect, useState } from 'react';

import useStore from 'store/Store';

import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSearchbar, IonSegment, IonSegmentButton, IonTitle, IonToolbar, useIonModal } from "@ionic/react";

import {
	cashOutline as fundsIcon,
	listOutline as historyIcon,
	closeCircleOutline as turnOffIcon,
	checkmarkCircle as settledIcon,
	helpCircleOutline as helpIcon,
	alertCircleOutline as noticeIcon
} from 'ionicons/icons';

const WalletHistoryPage = ({  }) => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);
	const [historyType,setHistoryType] = useState('outgoing');

	const retrieveWalletHistory = useStore((state) => state.retrieveWalletHistory);
	
	const walletSetupCompleted = useStore((state) => state.walletSetupCompleted);

	const [walletHistory,setWalletHistory] = useState(false);

	const refreshWalletHistory = (event) => {
		var startTime = new Date();

		retrieveWalletHistory(historyType)
		.then((walletHistory) => {
			console.log(walletHistory);
			setWalletHistory(walletHistory);
			var endTime = new Date();
			var timeDifference = endTime - startTime;
			
			var minimumTimeToDisplayLoading = 1500;
			var remainingTime = 0;
			
			if (timeDifference < minimumTimeToDisplayLoading) {
				remainingTime = minimumTimeToDisplayLoading - timeDifference;
			}
			setTimeout(() => {
				if (event && event.detail && event.detail.complete) {
					event.detail.complete();
				}
			},remainingTime);
		});
	}

	useEffect(() => {
		refreshWalletHistory();
	},[historyType]);

	const changeHistoryType = (e) => {
		setWalletHistory(false);
		// console.log(e.detail.value);
		setHistoryType(e.detail.value);
		// refreshWalletHistory();

	};
	

	return (
		<Page id="wallet" title="Wallet history" onRefresh={refreshWalletHistory}>
			<div className="ion-padding">
				<IonSegment value={historyType} onIonChange={changeHistoryType}>
					<IonSegmentButton value="outgoing">Outgoing</IonSegmentButton>
					<IonSegmentButton value="incoming">Incoming</IonSegmentButton>
				</IonSegment>



						<IonList lines="full" inset={true} >
							<IonListHeader>
								<IonLabel style={{ textTransform: 'capitalize' }}>{historyType} transactions</IonLabel>
							</IonListHeader>
							{ walletHistory !== false && walletHistory[historyType] && walletHistory[historyType].map((historyEntry) => {
								return (
									<HistoryEntry historyEntry={historyEntry} historyType={historyType} />
								);
							})};
						</IonList>
			</div>
		</Page>
	);
};
const HistoryEntry = ({ historyEntry, historyType }) => {
	if (historyEntry.boostagram) {
		return (
			<IonItem>
				<IonIcon icon={fundsIcon} slot="start" />
				{ historyEntry.state == 'SETTLED' &&
					<IonIcon icon={settledIcon} slot="end" color="success" />
				}
				<IonLabel>
					<h3>{historyEntry.boostagram.podcast}</h3>
					{ historyType === 'outgoing' &&
						<IonLabel slot="end">{historyEntry.boostagram.name} </IonLabel>
					}
					{ historyType === 'incoming' &&
						<IonLabel slot="end">{historyEntry.boostagram.sender_name} </IonLabel>
					}
					<p>{historyEntry.amount} sats</p>
					
				</IonLabel>
			</IonItem>
		);
	}
};
export default WalletHistoryPage;