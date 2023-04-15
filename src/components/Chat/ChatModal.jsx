import { IonButton, IonButtons, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonTitle, IonToolbar, IonModal, IonContent, IonFooter, IonPage, IonInput, IonSpinner } from "@ionic/react";

import useStore from 'store/Store';
import { useEffect, useState } from 'react';

import IRC from 'irc-framework';

import SadPodfriend from 'images/flow-illustrations/podfriend-sad.png';

import './ChatModal.scss';

const ChatModal = ({ onDismiss }) => {
	const closeModal = () => {
		onDismiss();
	};

	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);
	const [isLoading,setIsLoading] = useState(true);
	const [isSupported,setIsSupported] = useState(false);
	const [protocol,setProtocol] = useState(false);
	const [client,setClient] = useState(false);
	const [server,setServer] = useState(false);
	const [channel,setChannel] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		setIsSupported(false);
		setProtocol(false);
		setServer(false);
		setChannel(false);

		if (activeEpisode.chat) {
			var parts = activeEpisode.chat.split('/');

			var protocol = false;
			var serverPart = false;
			var channelPart = false;

			parts.forEach((part) => {
				if (part.includes('irc.')) {
					protocol = 'irc';
					serverPart = part;
				}
				if (part.includes('#')) {
					channelPart = part;
				}
			});
			if (protocol === 'irc') {
				setIsSupported(true);
				setProtocol(protocol);
				setServer(serverPart);
				setChannel(channelPart);
			}
			else {
				setIsLoading(false);
			}
		}
	},[activeEpisode.chat]);

	useEffect(() => {
		if (protocol === 'irc') {
			setIsLoading(false);
			/*
			var newClient = new IRC.Client();
			newClient.connect({
				host: server,
				port: 6667,
				nick: 'Podfriendbeta'
			});
			console.log(newClient);
			*/
			/*
			newClient = new irc.Client('irc.yourserver.com', 'Betatest123', {
				channels: ['#podfriend'],
			});
			setClient(newClient);
			*/
		}
		return () => {
			// IRC disconnect
		};
	},[protocol]);

	return (
		<IonPage className="chatPage">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Chat</IonTitle>
					<IonButtons slot="end">
						<IonButton onClick={closeModal}>Close</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen={true} className="chatContent">
				{ isLoading &&
					<div className="loading">
						<IonSpinner />
						<div className="loadingText">
							Loading chat
						</div>
					</div>
				}
				{ (!isLoading && !isSupported) &&
					<div className="notSupported">
						<div className="sadPodfriendContainer">
							<img src={SadPodfriend} className="sadPodfriend" />
						</div>
						<h1>Sorry!</h1>
							Sorry, this episode uses a chat type that is not yet supported. Podfriend supports IRC at the moment.<br /><br />
							But you can still go and participate in the chat outside of Podfriend.
						<div>
							<a href={activeEpisode.chat} target="_blank">{activeEpisode.chat}</a>
						</div>
					</div>
				}
				{ (!isLoading && isSupported) &&
					<iframe src={activeEpisode.chat}></iframe>
				}
				{ (!isLoading && isSupported && false) &&
					<div>
						<div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div>
						<div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div>
						<div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div>
						<div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div>
						<div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div>
						<div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div><div>Hello: Chat test2</div>
					</div>
				}
			</IonContent>
			{ (isSupported && false) &&
				<IonFooter translucent={true}>
					<IonInput type="text" className="chatInput" placeholder="Chat message" /> <IonButton>Send</IonButton>
				</IonFooter>
			}
		</IonPage>
	);
};
export default ChatModal;