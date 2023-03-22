import useStore from 'store/Store';

import { IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";

import playIcon from 'images/icons/play-circle.svg';
import dotsIcon from 'images/icons/dots.svg';

import {
	pauseCircleSharp as pauseIcon
} from 'ionicons/icons';

import { format, formatDistance, formatRelative } from 'date-fns';

const LiveItem = ({ podcastData, liveItem }) => {
	const startDate = liveItem.start ? new Date(liveItem.start) : false;
	const endDate = liveItem.end ? new Date(liveItem.end) : false;
	const now = new Date();

	const playEpisode = useStore((state) => state.playEpisode);
	const activeEpisode = useStore((state) => state.activeEpisode);
	const audioPause = useStore((state) => state.audioPause);
	const audioPlay = useStore((state) => state.audioPlay);
	const shouldPlay = useStore((state) => state.shouldPlay);

	const playLiveEpisode = () => {
		playEpisode(podcastData,liveItem.enclosure.url,liveItem);
	};

	const formatEpisodeStatusText = () => {
		if (!liveItem.status || liveItem.status != 'ended') {
			if (startDate && endDate && (startDate < now && endDate > now)) {
				return "Live now!";
			}
			else {
				if (endDate && endDate < now) {
					return "Latest live episode";
				}
				else {
					return 'Upcoming live episode';
				}
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
				{ (activeEpisode.guid === liveItem?.guid['#text'] && shouldPlay) &&
					<IonButton fill="clear" onClick={audioPause}>
						<IonIcon slot="start" icon={pauseIcon}></IonIcon>
						Pause episode
					</IonButton>
				}
				{ (activeEpisode.guid === liveItem?.guid['#text'] && !shouldPlay) &&
					<IonButton fill="clear" onClick={audioPlay}>
						<IonIcon slot="start" icon={playIcon}></IonIcon>
						Play
					</IonButton>
				}
				{ activeEpisode?.guid != liveItem?.guid['#text'] &&
					<IonButton fill="clear" onClick={playLiveEpisode}>
						<IonIcon slot="start" icon={playIcon}></IonIcon>
						Tune in
					</IonButton>
				}
				<IonButton color="secondary" fill="solid" style={{ float: 'right' }}><IonIcon slot="start" icon={dotsIcon}></IonIcon> Options</IonButton>
			</div>
		</div>
	);
};
const LiveEpisodes = ({ podcastData, liveItems }) => {
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
					<LiveItem podcastData={podcastData} liveItem={liveItem} key={liveItem.title + ':' + liveItem.startDate} />
				);
			})}
		</div>
	);
};
export default LiveEpisodes;