import { set } from "date-fns";
import { produceWithPatches } from "immer";

export const createWalletSlice = (set,get) => ({
	walletOnboardingShowed: false,
	updateWalletOnboardingShowed: (newValue) => {
		console.log('updaing updateWalletOnboardingShowed to: ' + newValue);
		set({
			walletOnboardingShowed: newValue
		});
	},
	walletSetupCompleted: false,
	walletBalance: 0,
	walletSyncing: false,
	walletTokenLastRefreshDate: false,
	walletToken: false,
	onDisconnectWallet: () => {
		const tokenURL = 'https://api.podfriend.com/user/wallet/token/';
		return fetch(tokenURL, {
			method: "DELETE",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			}
		})
		.then((response) => {
			if (response.ok) {
				console.log(response);
				return response.json();
			}
			else {
				console.log('Error happened while removing authtokens.');
				console.log(response);
				response.text()
				.then((errorText) => {
					console.log(errorText);
				});
				
				return Promise.reject(errorText);
			}
		})
		.then((response) => {
			console.log(response);
			console.log('AuthTokens removed');

			set({
				walletSetupCompleted: false,
				walletBalance: 0
			});

			return response;
		})
		.catch((exception) => {
			console.log('Error removing wallet token in WalletSlice::onDisconnectWallet');
			console.log(tokenURL);
			console.log(exception);

			return false;
		});
	},
	exchangeCodeToWalletToken: (code) => {
		// const tokenURL = 'https://api.podfriend.com/user/wallet/token/?development=' + (process.env.NODE_ENV === 'development' ? 'true' : 'false') + '&code=' + code;
		const tokenURL = 'https://api.podfriend.com/user/wallet/token/?code=' + code;
		return fetch(tokenURL, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			}
		})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			else {
				console.log('Error happened while retrieving exchanging code to token.');
				console.log(response);
				response.text()
				.then((errorText) => {
					console.log(errorText);
				});
				
				return Promise.reject(errorText);
			}
		})
		.then((response) => {
			set({
				walletSetupCompleted: true,
				walletTokenLastRefreshDate: new Date(),
				walletTokenExpiresIn: 7200
			});
			return response;
		})
		.catch((exception) => {
			console.log('Error retrieving wallet token in WalletSlice::exchangeCodeToWalletToken');
			console.log(tokenURL);
			console.log(exception);

			return false;
		});
	},
	doAlbyAuthTokenRefreshIfNeeded: () => {
		if (!get().walletSetupCompleted) {
			return Promise.resolve();
		}
		var walletTokenLastRefreshDate = get().walletTokenLastRefreshDate;
		var walletTokenExpiresIn = get().walletTokenExpiresIn;

		var shouldRefresh = false;

		if (walletTokenLastRefreshDate && walletTokenExpiresIn) {
			var secondsSinceLastUpdate = Math.floor((Math.abs(new Date() - walletTokenLastRefreshDate) / 1000));

			// We want a buffer, so we don't make a call just at the edge of the expire time
			if (secondsSinceLastUpdate > (walletTokenExpiresIn - 600)) {
				walletTokenLastRefreshDate = true;
			}
		}
		else {
			shouldRefresh = true;
		}
		if (shouldRefresh) {
			return get().refreshAlbyAuthToken();
		}
		return Promise.resolve();
	},
	refreshAlbyAuthToken: () => {
		const tokenURL = 'https://api.podfriend.com/user/wallet/token/?refresh=true';
		return fetch(tokenURL, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			}
		})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			else {
				return response.text();
			}
		})
		.then((response) => {
			console.log(response);
			console.log('AuthToken Refreshed');
			set({
				walletTokenLastRefreshDate: new Date(),
				walletTokenExpiresIn: response.expiresIn
			})
			return response;
		})
		.catch((exception) => {
			console.log('Error retrieving wallet token in WalletSlice::exchangeCodeToWalletToken');
			console.log(tokenURL);
			console.log(exception);

			return false;
		});
	},
	/*********************************
	* Account balance
	*********************************/
	isBoosting: false,
	boostValue: (valueBlock,totalAmount,overrideDestinations = false,senderName = false,message = false) => {
		return get().doAlbyAuthTokenRefreshIfNeeded()
		.then(() => {
			set({
				isBoosting: true
			});
			// console.log(message);
			return get().sendValue(valueBlock,totalAmount,overrideDestinations,'boost',senderName,message)
			.finally(() => {
				set({
					isBoosting: false
				});
			});
		});
	},
	defaultStreamAmount: 20,
	defaultBoostAmount: 1000,
	setDefaultStreamAmount: (newAmount) => {
		set({
			defaultStreamAmount: Number(newAmount)
		});
	},
	setDefaultBoostAmount: (newAmount) => {
		set({
			defaultBoostAmount: Number(newAmount)
		});
	},
	streamValue: () => {
		var activePodcast = get().activePodcast;
		var podcastState = get().podcasts[activePodcast.path];

		var streamAmount = podcastState.streamAmount ? podcastState.streamAmount : get().defaultStreamAmount;

		var userData = get().userData;

		get().sendValue(activePodcast.value,streamAmount,false,'stream',userData.username);
	},
	sendValue: (valueBlock,totalAmount,overrideDestinations = false,actionType = 'stream',senderName = false,message = false) => {
		return get().doAlbyAuthTokenRefreshIfNeeded()
		.then(() => {
			var recognizedMethod = false;
			var validDestinations = false;

			if (valueBlock.model && valueBlock.model.method === 'keysend' && valueBlock.model.type === 'lightning') {
				recognizedMethod = true;
			}
			if (overrideDestinations || valueBlock.destinations && valueBlock.destinations.length > 0) {
				validDestinations = true;
			}

			if (recognizedMethod && validDestinations) {
				console.log('sending value');
				console.log(valueBlock);

				const activePodcast = get().activePodcast;
				const activeEpisode = get().activeEpisode;
				const episodeState = get().podcasts[activePodcast.path]?.episodes[activeEpisode.guid];

				var currentTime = episodeState ? episodeState.currentTime : false;

				var currentValueTimeSplits = get().currentValueTimeSplits;
				if (currentValueTimeSplits) {
					// console.log(currentValueTimeSplits);
					for(var i=0;i<currentValueTimeSplits.length;i++) {
						if (currentTime >= currentValueTimeSplits[i].startTime && currentTime <= currentValueTimeSplits[i].endTime) {
							console.log('Woohoo, found a currentValueTimeSplit that matches the current time.');
							console.log(currentValueTimeSplits[i].value);
							console.log(valueBlock.destinations);
							overrideDestinations = currentValueTimeSplits[i].value;
						}
					}
				}

				var debug = false;

				var podcastInfo = {
					name: activePodcast.name,
					path: activePodcast.path,
					feedUrl: activePodcast.feedUrl,
					feedId: activePodcast.id,
					podcastGuid: activePodcast.guid,
					episodeName: activeEpisode.title,
					episodeGuid: activeEpisode.guid,
					episodeId: activeEpisode.id,
					currentTime: currentTime
				};

				// console.log(podcastInfo);

				const valueData = {
					valueType: valueBlock.model.type,
					valueMethod: valueBlock.model.method,
					amount: totalAmount,
					destinations: overrideDestinations ? overrideDestinations : valueBlock.destinations,
					actionType: actionType,
					podcastInfo: podcastInfo
				};
				if (senderName) {
					valueData.senderName = senderName;
				}
				if (message) {
					valueData.message = message;
				}

				const walletInvoiceURL = 'https://api.podfriend.com/user/wallet/send/' + (debug ? '?debug=true' : '');
				return fetch(walletInvoiceURL, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Authorization': `Bearer ${get().authToken}`
					},
					body: JSON.stringify(valueData)
				})
				.then((resp) => {
					// return resp.text();
					return resp.json();
				})
				.then((response) => {
					console.log('sent value!');
					console.log(response);
					return Promise.resolve({
						success: 1
					});
				})
				.catch((error) => {
					console.log('error sending value');
					console.log(error);

					return Promise.resolve({
						success: 0
					});
				});
			}
			else {
				console.log('WalletSlice::sendValue error: Unrecognized method or invalid destinations.');
			}
		});
	},
	/*********************************
	* Time splits
	*********************************/
	currentValueTimeSplits: false,
	processValueTimeSplit: async (timeSplits) => {
		set({
			currentValueTimeSplits: false
		});
		if (timeSplits) {
			console.log('timesplits exists');
			console.log(timeSplits);

			var newTimeSplits = [];

			for(var i=0;i<timeSplits.length;i++) {
				var timeSplit = timeSplits[i];

				var newTimeSplit = {
					startTime: parseInt(timeSplit.startTime),
					endTime: parseInt(timeSplit.startTime) + parseInt(timeSplit.duration),
					duration: parseInt(timeSplit.duration)
				};
				console.log('foreach timesplit');
				if (timeSplit['podcast:remoteItem'] && timeSplit['podcast:remoteItem'].feedGuid) {
					var podcastInformation = await get().retrievePodcastByGuid(timeSplit['podcast:remoteItem'].feedGuid)
					if (podcastInformation) {
						podcastInformation = podcastInformation[0];
						if (timeSplit['podcast:remoteItem'].itemGuid) {
							console.log('ValueTimeSplit: Using value from episode level');
							console.log(podcastInformation);
							var originalFeed = await get().retrieveOriginalPodcastFeed(podcastInformation.path,podcastInformation.url)
							console.log('ValueTimeSplit: Got original feed ');
							console.log(originalFeed);
							if (originalFeed.items && originalFeed.items.forEach) {
								originalFeed.items.forEach((episode) => {
									if (episode.guid === timeSplit['podcast:remoteItem'].itemGuid) {
										console.log('Found value episode');
										console.log(episode.value);

										newTimeSplit.value = episode.value['podcast:valueRecipient'];
									}
								});
							}

						}
						else {
							console.log('ValueTimeSplit: Using value from podcast level');
							console.log(podcastInformation);
							newTimeSplit.value = podcastInformation.value;
						}
					}

				}
				newTimeSplits.push(newTimeSplit);
			}
			console.log('newTimeSplits');
			console.log(newTimeSplits);
			set({
				currentValueTimeSplits: newTimeSplits
			});
		}
	},
	/*********************************
	* Account balance
	*********************************/
	updateAccountBalance: () => {
		return get().doAlbyAuthTokenRefreshIfNeeded()
		.then(() => {
			const balanceURL = 'https://api.podfriend.com/user/wallet/balance/';
			return fetch(balanceURL, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${get().authToken}`
				}
			})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				else {
					return response.text();

				}
			})
			.then((response) => {
				console.log(response);

				if (response.balance) {
					set({
						walletBalance: response.balance
					});
					return response;
				}
				else {
					return Promise.reject(response);
				}
			})
			.catch((exception) => {
				console.log('Error retrieving balance');
				console.log(balanceURL);
				console.log(exception);

				return false;
			});
		});
	},
	retrieveWalletHistory: (type = 'outgoing') => {
		return get().doAlbyAuthTokenRefreshIfNeeded()
		.then(() => {
			const incomingURL = 'https://api.podfriend.com/user/wallet/history/?type=' + type;
			return fetch(incomingURL, {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${get().authToken}`
				}
			})
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				else {
					return response.text();
				}
				
			})
			.then((response) => {
				// console.log(response);
				/*
				set({
					walletIngoingHistory: response.walletIngoingHistory
				});
				*/
				if (response.history) {
					return response.history;
				}
				else {
					console.log(response);
					return Promise.reject(response);
				}
			})
			.catch((exception) => {
				console.log('Error retrieving history');
				console.log(exception);

				return false;
			});
		});
	},
	/*********************************
	* Legacy wallet
	*********************************/
	legacyWalletBalance: false,
	legacyWalletSyncing: false,
	synchronizeLegacyWallet: () => {
		const walletBalanceURL = 'https://api.podfriend.com/user/wallet/';

		set({
			legacyWalletSyncing: true
		});

		return fetch(walletBalanceURL, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			}
		})
		.then((resp) => {
			return resp.json();
		})
		.then((response) => {
			// console.log('WALLET SYNC');
			// console.log(response);

			set({
				legacyWalletBalance: response.balance,
				legacyWalletSyncing: false
			});
		})
		.catch((error) => {
			console.log('error synchronizing wallet data.');
			console.log(error);

			set({
				legacyWalletSyncing: false
			});
		});
	},
	legacyBoostPodcast: (valueBlock,boostAmount,overrideDestinations = false,senderName = false,message = false) => {
		return get().legacySendValue(valueBlock,boostAmount,overrideDestinations,'boost',senderName,message);
	},
	legacySendValue: (valueBlock,totalAmount,overrideDestinations = false,actionType = 'stream',senderName = false,message = false) => {
		var recognizedMethod = false;
		var validDestinations = false;

		if (valueBlock.model && valueBlock.model.method === 'keysend' && valueBlock.model.type === 'lightning') {
			recognizedMethod = true;
		}
		if (overrideDestinations || valueBlock.destinations && valueBlock.destinations.length > 0) {
			validDestinations = true;
		}

		if (recognizedMethod && validDestinations) {
			console.log('sending value');
			console.log(valueBlock);

			var activePodcast = get().activePodcast;
			var activeEpisode = get().activeEpisode;

			var currentValueTimeSplits = get().currentValueTimeSplits;

			console.log(currentValueTimeSplits);

			if (currentValueTimeSplits) {
				
				for(var i=0;i<currentValueTimeSplits.length;i++) {

				}
			}

			const valueData = {
				valueType: valueBlock.model.type,
				valueMethod: valueBlock.model.method,
				amount: totalAmount,
				destinations: overrideDestinations ? overrideDestinations : valueBlock.destinations,
				actionType: actionType,
				podcastInfo: {
					name: activePodcast.name,
					path: activePodcast.path,
					feedUrl: activePodcast.feedUrl,
					feedId: activePodcast.id,
					podcastGuid: activePodcast.guid,
					episodeName: activeEpisode.title,
					episodeGuid: activeEpisode.guid,
					episodeId: activeEpisode.id,
					currentTime: activeEpisode.currentTime
				}
			};
			if (senderName) {
				valueData.senderName = senderName;
			}
			if (message) {
				valueData.message = message;
			}
			// console.log(valueData);

			const walletInvoiceURL = 'https://api.podfriend.com/user/wallet/keysend/' + (false ? '?debug=true' : '');
			return fetch(walletInvoiceURL, {
				method: "POST",
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'Authorization': `Bearer ${get().authToken}`
				},
				body: JSON.stringify(valueData)
			})
			.then((resp) => {
				return resp.json()
			})
			.then((response) => {
				console.log('sent value!');
				console.log(response);
				return Promise.resolve({
					success: 1
				});
			})
			.catch((error) => {
				console.log('error sending value');
				console.log(error);

				return Promise.resolve({
					success: 0
				});
			});
		}
	},
	legacyWalletInvoiceLoading: false,
	legacyWalletInvoiceError: false,
	legacyWalletInvoiceId: false,
	legacyWalletInvoiceString: false,
	legacyWalletInvoiceDate: new Date(),
	getInvoice: (amount) => {
		set({
			invoiceLoading: true
		});

		const walletInvoiceURL = 'https://api.podfriend.com/user/wallet/invoice/?amount=' + amount;
		return fetch(walletInvoiceURL, {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': `Bearer ${get().authToken}`
			}
		})
		.then((resp) => {
			return resp.json()
		})
		.then((response) => {
			set({
				legacyWalletInvoiceLoading: false,
				legacyWalletInvoiceError: false,
				legacyWalletInvoiceId: response['id'],
				legacyWalletInvoiceString: response['payment_request'],
				legacyWalletInvoiceDate: new Date()
			});
		})
		.catch((error) => {
			console.log('error getting wallet invoice data.');
			console.log(error);

			set({
				legacyWalletInvoiceError: 'Error getting wallet invoice data.'
			});
		});
	},
});