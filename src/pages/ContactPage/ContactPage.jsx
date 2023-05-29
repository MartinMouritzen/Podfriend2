import { useState, useEffect } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from "@ionic/react";
import Page from "components/Page/Page";

import useStore from 'store/Store';

import ContactPodfriendImage from 'images/onboarding/contact.png';

import './ContactPage.scss';

const ContactPage = () => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);

	const [name,setName] = useState('');
	const [email,setEmail] = useState('');
	const [reason,setReason] = useState(false);
	const [message,setMessage] = useState('');
	const [success,setSuccess] = useState(false);

	const [errorMessage,setErrorMessage] = useState(false);

	useEffect(() => {
		if (userData && userData.username) {
			setName(userData.username);
		}
	},[userData?.username]);
	useEffect(() => {
		if (userData && userData.email) {
			setEmail(userData.email);
		}
	},[userData?.email]);

	const onNameChange = (event) => {
		setName(event.detail.value);
	};
	const onEmailChange = (event) => {
		setEmail(event.detail.value);
	};
	const onReasonChange = (event) => {
		setReason(event.detail.value);
	};
	const onMessageChange = (event) => {
		setMessage(event.detail.value);
	};

	let readyToSend = true;

	if (!reason) {
		readyToSend = false;
	}
	else if (reason == 'I own a podcast and I want it on Podfriend' || reason == 'I want my podcast removed') {
		readyToSend = false;
	}
	else if (!message) {
		readyToSend = false;
	}

	const sendForm = (event) => {
		setErrorMessage(false);

		event.preventDefault();

		var url = "https://api.podfriend.com/contact/";
		
		var formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
		formData.append('reason', reason);
		formData.append('message', message);
        
		return fetch(url, {
			method: 'POST',
			headers: {
				'Accept': 'application/json'
			},
			body: formData
		})
		.then((resp) => {
			return resp.json()
		})
		.then((data) => {
			if (data.error) {
				console.log('Error posting message: ' + data.error);
				setErrorMessage(data.error);
			}
			else {
				if (data.success) {
					setSuccess(true);
				}
				else {
					setErrorMessage('An error happened while sending the contact form. This is probably not your fault. Please try again, or send an email directly to info@podfriend.com');
					console.log('No success returned when logging in');
				}
			}
		})
		.catch((error) => {
			setErrorMessage('An error happened while sending the contact form. This is probably not your fault. Please try again, or send an email directly to info@podfriend.com');
			console.log(error);
		});
	};

	return (
		<Page title="Contact Podfriend" defaultHeader={false}>
			<div className="pageContainer">
				<div className="imageContainer">
					<img src={ContactPodfriendImage} />
				</div>
				<div className="greyPage contactPage">
					<IonHeader collapse="condense" className="mainTitleHeader">
						<IonToolbar>
							<IonTitle size="large">Contact Podfriend</IonTitle>
						</IonToolbar>
					</IonHeader>
					{ success && 
						<div className="ion-padding">
							Thanks for reaching out. You will get a reply as fast as humanly possible!
						</div>
					}
					{ !success &&
						<div className="ion-padding" style={{ paddingTop: 0 }}>
							<h2>I love feedback!</h2>
							<p>Do you have <b>suggestions, requests</b> or just want to say <b>&quot;Hey I love you Podfriend!&quot;?</b> Then congratulations. You found the right place!</p>


								
									<form onSubmit={sendForm}>
										<IonList>
											<IonListHeader>
												<IonLabel>Please fill out a few details</IonLabel>
											</IonListHeader>
											<IonItem>
												<IonLabel position="floating" >Your name</IonLabel>
												<IonInput onIonChange={onNameChange} autoCapitalize={true} autocomplete='name' enterkeyhint="next" value={name} />
											</IonItem>
											<IonItem>
												<IonLabel position="floating">Your email</IonLabel>
												<IonInput onIonChange={onEmailChange} type="email" autocomplete='email' enterkeyhint="next" inputmode="email" value={email} />
											</IonItem>
											<IonItem>
												<IonLabel position="floating">What is this about?</IonLabel>
												<IonSelect placeholder="Please pick a reason" interface="action-sheet" onIonChange={onReasonChange} enterkeyhint="next">
													<IonSelectOption>I would like to report a bug</IonSelectOption>
													<IonSelectOption>I would like to request a feature</IonSelectOption>
													<IonSelectOption>I have general feedback</IonSelectOption>
													<IonSelectOption>I own a podcast and I want it on Podfriend</IonSelectOption>
													<IonSelectOption>I want my podcast removed</IonSelectOption>
													<IonSelectOption>Other</IonSelectOption>
												</IonSelect>
											</IonItem>
											{ reason == 'I own a podcast and I want it on Podfriend' && 
												<div className="notice">
													<b>To do this, go to podcastindex.org</b><br />
													Podfriend uses Podcastindex.org for it's podcasting data.<br />
													To get your podcast added to Podfriend, go to their <a href="https://podcastindex.org/add" target="_blank">Add Podcast page</a>.
												</div>
											}
											{ reason == 'I want my podcast removed' &&
												<div className="notice">
													<b>To do this, go to podcastindex.org</b><br />
													Podfriend uses Podcastindex.org for it's podcasting data.<br />
													To get your podcast removed from Podfriend, contact <a href="mailto:info@podcastindex.org">info@podcastindex.org</a>.<br /><br />
													Before you do this, make sure that you have removed your RSS feed at your podcast host. Otherwise the show will likely be reindexed.
												</div>
											}
											<IonItem>
												<IonLabel position="floating">Your message</IonLabel>
												<IonTextarea autoGrow={true} onIonChange={onMessageChange} enterkeyhint="send" />
											</IonItem>
										</IonList>
										<div style={{ marginTop: 20 }}>
											{ errorMessage &&
												<div className="error">
													{errorMessage}
												</div>
											}
										<IonButton expand='block' disabled={!readyToSend} type="submit">Send message</IonButton>
										</div>

									</form>
						


							<div style={{ marginTop: 20 }}>
								<h3>One man band</h3>
								<p>Please do remember, that Podfriend currently is a <b>one man operation</b>, and while I always strive to answer as fast as possible, then often it's simply not possible because of other priorities.</p>
							</div>

						</div>
					}
				</div>
			</div>
		</Page>
	);
}
export default ContactPage;