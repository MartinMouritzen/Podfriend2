import React, { useState, useEffect } from 'react';

import useStore from 'store/Store';

import TimeUtil from "library/TimeUtil";

import ShareButtons from './ShareButtons.jsx';

import { IonButton, IonButtons, IonHeader, IonSearchbar, IonSpinner, IonTitle, IonToolbar, IonContent, useIonModal, IonModal  } from "@ionic/react";

import './ShareModal.scss';

const ShareModal = ({ isOpen, onDismiss, podcast, episode }) => {

	const episodeState = useStore((state) => state.podcasts[podcast.path]?.episodes[episode.guid]);

	const [shareMessage,setShareMessage] = useState('');
	const [shareUrl,setShareUrl] = useState('https://www.podfriend.com/podcast/' + podcast.path + '/episode/' + encodeURIComponent(episode.guid));
	const [includeTime,setIncludeTime] = useState(false);
	const [timeStamp,setTimeStamp] = useState(TimeUtil.formatPrettyDurationText(Math.round(episodeState?.currentTime)));

	// console.log(episode);

	useEffect(() => {
		var newShareUrl = 'https://www.podfriend.com/podcast/' + podcast.path + '/episode/' + encodeURIComponent(episode.guid);

		if (includeTime) {
			newShareUrl += '?t=' + TimeUtil.HmsToSeconds(timeStamp)
		}
		setShareUrl(newShareUrl);
	},[includeTime,timeStamp,episode]);

	useEffect(() => {
		setShareMessage('Check out this episode: ' + episode.title + ', from the podcast ' + podcast.name + ': ' + shareUrl);
	},[shareUrl]);

	const changeIncludeTime = (event) => {
		const target = event.target;

		setIncludeTime(target.checked);
	};

	const changeTimeStamp = (event) => {
		setTimeStamp(event.target.value);
	};

	return (
		<IonModal canDismiss={true} isOpen={isOpen} onDidDismiss={onDismiss}>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Share episode</IonTitle>
					<IonButtons slot="end">
						<IonButton onClick={onDismiss}>Close</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<div className={'modalPage shareModal'}>
					<div>
						<div className='episodeTitle'>{episode.title}</div>
						<div className='instructionLabel'>Link: </div>
						<div><input readOnly className='shareUrlInput' type="text" value={shareUrl} /></div>
						<div>
							<input type="checkbox" checked={includeTime} onClick={changeIncludeTime} className='timeCheckbox' /> Start at <input type="text" value={timeStamp} onChange={changeTimeStamp} className='timeStampInput' name={episode.currentTime} />
						</div>
						<ShareButtons
							shareUrl={shareUrl}
							podcastTitle={podcast.name}
							podcastPath={podcast.path}
							episodeId={episode.id}
							episodeTitle={episode.title}
							episodeDescription={episode.description}
							timeStamp={timeStamp}
						/>

						<div className='instructionLabel'>Easy text to copy & paste: </div>
						<textarea value={shareMessage} />
					</div>
				</div>
			</IonContent>
		</IonModal>
	);
};

export default ShareModal;