import { set } from "date-fns";

export const createWalletSlice = (set,get) => ({
	walletBalance: 0,
	walletSyncing: false,
	synchronizeWallet: () => {
		const walletBalanceURL = 'https://api.podfriend.com/user/wallet/';

		set({
			walletSyncing: true
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
				walletBalance: response.balance,
				walletSyncing: false
			});
		})
		.catch((error) => {
			console.log('error synchronizing wallet data.');
			console.log(error);

			set({
				walletSyncing: false
			});
		});
	},
	boostPodcast: (valueBlock,boostAmount,overrideDestinations = false,senderName = false,message = false) => {
		return sendValue(valueBlock,boostAmount,overrideDestinations,'boost',senderName,message);
	},
	sendValue: (valueBlock,totalAmount,overrideDestinations = false,actionType = 'stream',senderName = false,message = false) => {
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

			var debug = false;
			var async = true;
			if (debug) {
				async = false;
				totalAmount = 10;
			}

			const valueData = {
				valueType: valueBlock.model.type,
				valueMethod: valueBlock.model.method,
				amount: totalAmount,
				destinations: overrideDestinations ? overrideDestinations : valueBlock.destinations,
				actionType: actionType,
				async: async,
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

			const walletInvoiceURL = 'https://api.podfriend.com/user/wallet/keysend/' + (debug ? '?debug=true' : '');
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
	walletInvoiceLoading: false,
	walletInvoiceError: false,
	walletInvoiceId: false,
	walletInvoiceString: false,
	walletInvoiceDate: new Date(),
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
				walletInvoiceLoading: false,
				walletInvoiceError: false,
				walletInvoiceId: response['id'],
				walletInvoiceString: response['payment_request'],
				walletInvoiceDate: new Date()
			});
		})
		.catch((error) => {
			console.log('error getting wallet invoice data.');
			console.log(error);

			set({
				walletInvoiceError: 'Error getting wallet invoice data.'
			});
		});
	}
});