import { IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";

import playIcon from 'images/icons/play-circle.svg';
import dotsIcon from 'images/icons/dots.svg';

import { format, formatDistance, formatRelative } from 'date-fns';

const LiveItem = ({ liveItem }) => {
	const startDate = liveItem.start ? new Date(liveItem.start) : false;
	const endDate = liveItem.end ? new Date(liveItem.end) : false;
	const now = new Date();

	const formatEpisodeStatusText = () => {
		if (!liveItem.status || liveItem.status != 'ended') {
			if (startDate && endDate && (startDate < now && endDate > now)) {
				return "Live!";
			}
			else {
				return 'Upcoming live episode';
			}
		}
		if (liveItem.status === 'ended') {
			return 'Latest live episode';
		}
	};

	return (
		<div className="liveItem" key={liveItem.title}>
			<div className="content">
				<img src={liveItem['itunes:image'].href} style={{ width: 100, float: 'right' }} />
				<div className="liveBadge">
					{ formatEpisodeStatusText() }
					
					</div>
				<h2>{liveItem.title}</h2>
				{ startDate &&
					<div className="liveDate">
						{formatRelative(startDate,new Date())}
					</div>
				}
				<div className="scheduleText">
					{ endDate < now && 
						<>
							Ended {formatDistance(endDate, new Date())} ago
						</>
					}
					{ (startDate && (!endDate || startDate > now)) && 
						<>
							Scheduled to start in {formatDistance(startDate, new Date())}
						</>
					}
				</div>
			</div>
			<div className="actionBar">
				<IonButton fill="clear">
					<IonIcon slot="start" icon={playIcon}></IonIcon>
					Listen to episode
				</IonButton>
				<IonButton color="secondary" fill="solid" style={{ float: 'right' }}><IonIcon slot="start" icon={dotsIcon}></IonIcon> Options</IonButton>
			</div>
		</div>
	);
};
const LiveEpisodes = ({ liveItems }) => {
	/*
	return (
		<div>
			{ liveItems.map((liveItem) => {
				return (
					<IonCard>
						<IonCardHeader>
							<IonCardTitle>{liveItem.title}</IonCardTitle>
							<IonCardSubtitle>{liveItem.title}</IonCardSubtitle>
						</IonCardHeader>
						<IonCardContent>
						{liveItem.title}
						</IonCardContent>
					</IonCard>
				);
			} ) }
		</div>
	);
	*/
	return (
		<div>
			{ liveItems.map((liveItem) => {
				return (
					<LiveItem liveItem={liveItem} key={liveItem.title + ':' + liveItem.startDate} />
				);
			})}
		</div>
	);
};
export default LiveEpisodes;