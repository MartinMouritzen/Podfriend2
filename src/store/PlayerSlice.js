import produce from 'immer'

export const createPlayerSlice = (set,get) => ({
	/**********************************************************************************
	* Player UI
	***********************************************************************************/
	audioController: false,
	setAudioController: (audioController) => {
		set({ audioController: audioController })
	},
	playerFullscreen: false,
	playerMaximize: () => {
		set({ playerFullscreen: true })
	},
	playerMinimize: () => {
		set({ playerFullscreen: false })
	},
	/**********************************************************************************
	* Player states
	***********************************************************************************/
	shouldPlay: false,
	isPlaying: false,
	isLoading: false,
	/**********************************************************************************
	* Playback speed
	***********************************************************************************/
	playbackSpeed: 1,
	setPlaybackSpeed: (speed) => {
		set({
			playbackSpeed: speed
		});
	},
	/**********************************************************************************
	* Audio functions
	***********************************************************************************/
	playEpisode: async (podcastPath,podcastData,episodeGuid,live = false) => {
		get().audioIsLoading();
		// console.log(podcast);
		// console.log(episodeUrl);
		// episodeUrl = episodeUrl.url ? episodeUrl.url : episodeUrl;

		// console.log('podcast');
		// console.log(podcast);

		let episode = false;

		if (podcastData === false) {
			console.log('No podcastdata. Retrieving it.');
			podcastData = await get().getPodcastFromCache(podcastPath);

			var shouldUpdate = get().shouldPodcastUpdate(podcastData);
			if (shouldUpdate) {
				get().retrievePodcastFromServer(podcastPath);
			}
		}

		if (live) {
			console.log(live);
			episode = {
				title: live.title,
				url: live.enclosure?.url,
				chat: live.chat,
				image: (live['itunes:image'] && live['itunes:image'].href) ? live['itunes:image'].href : live['podcast:images'] ? live['podcast:images'].srcset : false,
				guid: live.guid['#text'] ? live.guid['#text'] : live.guid,
				live: true
			};
		}
		else {
			if (!podcastData.episodes) {
				console.log('No episodes in podcastdata when trying to play episode. Trying to get it from server (' + podcastPath + ')');
				podcastData = await get().retrievePodcastFromServer(podcastPath);
			}
			episode = podcastData.episodes.find(e => e.guid === episodeGuid);
		}
		
		if (episode) {
			// console.log(episode);
			// console.log(get().podcasts[podcastPath].episodes[episodeGuid].currentTime);
			// var episodeState = get().
			// return;
			set(
				produce((state) => {
					state.activePodcast = podcastData;
					state.activePodcastPath = podcastPath;
					state.activeEpisodeGuid = episodeGuid;
					state.activeEpisode = episode;
					state.podcasts[podcastPath].lastListened = new Date();
					if (!state.podcasts[podcastPath].episodes[episodeGuid]) {
						state.podcasts[podcastPath].episodes[episodeGuid] = {};
					}
					state.podcasts[podcastPath].episodes[episodeGuid].lastPlayed = new Date();
					state.shouldPlay = true;
					state.loading = true;
				})
			)
			if (get().loggedIn) {
				get().synchronizeEpisodeState();
			}
			/*
			setTimeout(() => {
				get().audioSetCurrentTime(get().podcasts[podcastPath].episodes[episodeGuid].currentTime ? get().podcasts[podcastPath].episodes[episodeGuid].currentTime : 0);
			},50);
			*/
		}
		else {
			console.log('Error happened in playEpisode. Could not find episode');
			console.log(podcastData);
			console.log(episodeGuid);
		}
	},
	audioPause: () => {
		set({
			shouldPlay: false
		});
		get().audioController.pause();
	},
	audioPlay: () => {
		set({
			shouldPlay: true
		});
		var playPromise = get().audioController.play();

		if (playPromise.then) {
			Promise.resolve(playPromise)
			.then(() => {
				// Set loading = false
			})
			.catch((exception) => {
				console.log('Error trying to play audio');
			});
		}
	},
	audioBackwardIncrement: 10,
	audioForwardIncrement: 30,
	audioSetCurrentTime: (currentTime) => {
		var audioController = get().audioController;
		if (audioController) {
			audioController.setCurrentTime(currentTime);
			get().resetPlayingSegmentTime();
		}
	},
	audioBackward: () => {
		var audioController = get().audioController;

		if (audioController) {
			var currentTime = audioController.getCurrentTime();

			var backwardTime = currentTime - get().audioBackwardIncrement;
			if (backwardTime < 0) {
				backwardTime = 0;
			}

			audioController.setCurrentTime(backwardTime);
			get().resetPlayingSegmentTime();
			/*
			audioController.pause()
			.then(() => {
				return audioController.setCurrentTime(backwardTime);
			})
			.then(() => {
				if (get().shouldPlay) {
					audioController.play();
					get().resetPlayingSegmentTime();
				}
			});
			*/
		}
	},
	audioForward: () => {
		var state = get();
		var audioController = state.audioController;
		const audioForwardIncrement = get().audioForwardIncrement;

		if (audioController) {
			var currentTime = audioController.getCurrentTime();

			if (currentTime + audioForwardIncrement > audioController.getDuration()) {
				state.goToNextEpisode();
			}
			else {
				// audioController.forward();
				audioController.setCurrentTime(currentTime + audioForwardIncrement);
				state.resetPlayingSegmentTime();
				/*
				audioController.pause()
				.then(() => {
					return audioController.setCurrentTime(currentTime + audioForwardIncrement);
				})
				.then(() => {
					if (state.shouldPlay) {
						audioController.play();
						state.resetPlayingSegmentTime();
					}
				});
				*/
			}
		}
	},
	audioSkipBackward: () => {
		const audioController = get().audioController;
		const activePodcast = get().activePodcast;
		const activeEpisode = get().activeEpisode;

		var podcastState = get().podcasts[get().activePodcastPath];
		var activeEpisodeState = get().podcasts[get().activePodcastPath].episodes[get().activeEpisodeGuid];

		var foundNextEpisode = false;
		var nextEpisodeIsAfterCurrent = false;

		

		if (podcastState.sortOrder === 'old') {
			for(var i=0;i<activePodcast.episodes.length;i++) {
				if (nextEpisodeIsAfterCurrent) {
					if (activePodcast.episodes[i].episodeType !== 'trailer') {
						foundNextEpisode = true;
						get().playEpisode(activePodcast.path,activePodcast,activePodcast.episodes[i].guid);
						break;
					}
				}
				if (activePodcast.episodes[i].guid === activeEpisode.guid) {
					nextEpisodeIsAfterCurrent = true;
				}
			}
		}
		else {
			for(var i=activePodcast.episodes.length - 1;i>=0;i--) {
				if (nextEpisodeIsAfterCurrent) {
					if (activePodcast.episodes[i].episodeType !== 'trailer') {
						foundNextEpisode = true;
						get().playEpisode(activePodcast.path,activePodcast,activePodcast.episodes[i].guid);
						break;
					}
				}
				if (activePodcast.episodes[i].guid === activeEpisode.guid) {
					nextEpisodeIsAfterCurrent = true;
				}
			}
		}
		if (!foundNextEpisode) {
			console.log('Did not find previous episode.');
		}
	},
	audioSkipForward: () => {
		const audioController = get().audioController;
		const activePodcast = get().activePodcast;
		const activeEpisode = get().activeEpisode;

		var podcastState = get().podcasts[get().activePodcastPath];
		var activeEpisodeState = get().podcasts[get().activePodcastPath].episodes[get().activeEpisodeGuid];

		var percentage = (100 * audioController.getCurrentTime()) / audioController.getDuration();

		if (percentage > 75) {
			get().markEpisodeAsListened(activePodcast,activeEpisode);
		}

		var foundNextEpisode = false;
		var nextEpisodeIsAfterCurrent = false;

		if (podcastState.sortOrder === 'old') {
			for(var i=activePodcast.episodes.length - 1;i>=0;i--) {
				if (nextEpisodeIsAfterCurrent) {
					if (activePodcast.episodes[i].episodeType !== 'trailer') {
						foundNextEpisode = true;
						console.log(activePodcast);
						console.log(activePodcast.episodes[i]);
						get().playEpisode(activePodcast.path,activePodcast,activePodcast.episodes[i].guid);
						break;
					}
				}
				if (activePodcast.episodes[i].guid === activeEpisode.guid) {
					nextEpisodeIsAfterCurrent = true;
				}
			}
		}
		else {
			for(var i=0;i<activePodcast.episodes.length;i++) {
				if (nextEpisodeIsAfterCurrent) {
					if (activePodcast.episodes[i].episodeType !== 'trailer') {
						foundNextEpisode = true;
						get().playEpisode(activePodcast.path,activePodcast,activePodcast.episodes[i].guid);
						break;
					}
				}
				if (activePodcast.episodes[i].guid === activeEpisode.guid) {
					nextEpisodeIsAfterCurrent = true;
				}
			}
		}
		if (!foundNextEpisode) {
			console.log('Did not find next episode.');
		}
	},
	setCurrentTime: (seconds) => {
		get().audioController.setCurrentTime(seconds);
		get().updateProgress();
	},
	changeActiveEpisode: (podcast,episode,episodeState) => {
		if (!podcast || !episode || !episodeState) {
			console.log('changeActiveEpisode missing either podcast, episode or episodeState');
			console.log(podcast);
			console.log(episode);
			console.log(episodeState);
			return;
		}
		var audioController = get().audioController;
		
		if (audioController) {
			audioController.pause()
			.then(() => {
				audioController.setEpisode(podcast,episode)
				.then(() => {
					audioController.load()
					.then(() => {
						var currentTime = 0;

						if (episodeState && episodeState.currentTime) {
							var percentageListened = (100 * episodeState.currentTime) / episodeState.duration;
							
							if (percentageListened < 95) {
								currentTime = episodeState.currentTime;
							}
						}
						// console.log('setting time: ' + currentTime);

						audioController.setPlaybackRate(get().playbackSpeed);

						audioController.setCurrentTime(currentTime)
						.then(() => {
							if (get().shouldPlay) {
								get().audioPlay();
							}
						});
					});
				});
			});
		}
		else {
			setTimeout(() => {
				get().changeActiveEpisode(podcast,episode,episodeState);
			},50);
		}
	},
	streamDataLoading: true,
	audioIsLoading: () => {
		set({
			streamDataLoading: true
		});
	},
	audioIsReady: () => {
		const audioController = get().audioController;
		const activePodcast = get().activePodcast;
		const activeEpisode = get().activeEpisode;
		let newDuration = audioController.getDuration();
		// console.log('OnloadedMetaData. duration: ' + newDuration + ', episodeid: ' + this.props.activeEpisode.id);

		// alert(this.props.audioController.audioElement.current.currentTime);

		// alert('set time: ' + this.props.activeEpisode.currentTime);
		// this.setCurrentTime(get().activeEpisode.currentTime);

		// alert(this.props.audioController.audioElement.current.currentTime);

		// get().updateEpisodeDuration(newDuration);

		/*
		this.setState({
			duration: newDuration
		});
		*/
		// On IOS sometimes only this event is sent, not the onCanPlay - so we use this to signal that we can play too
		set(
			produce((state) => {
				state.streamDataLoading = false;
				state.podcasts[activePodcast.path].episodes[activeEpisode.guid].duration = newDuration;
			})
		);
	},
	/**********************************************************************************
	* Progress related
	***********************************************************************************/
	updateProgressSecondsConfig: 10,
	lastUpdatedProgressToServer: false,
	updateProgress: () => {
		var activeEpisode = get().activeEpisode;
		if (activeEpisode.live) {
			return;
		}
		var activePodcast = get().activePodcast;

		var activeEpisodeState = get().podcasts[get().activePodcastPath].episodes[get().activeEpisodeGuid];

		var currentDuration = get().audioController.getDuration();
		var newProgress = get().audioController.getCurrentTime();
		var newDuration = isNaN(currentDuration) ? activeEpisodeState.duration : currentDuration;
		let listenedPercentage = (100 * newProgress) / newDuration;

		var secondsLeft = newDuration - newProgress;

		if (get().loggedIn) {
			// Update state to server.
			var shouldUpdateToServer = false;
			var lastUpdatedProgressToServer = get().lastUpdatedProgressToServer;

			if (!lastUpdatedProgressToServer) {
				shouldUpdateToServer = true;
			}
			else {
				var secondsSinceLastEpisodeUpdateToServer = Math.floor(new Date().getTime() - lastUpdatedProgressToServer) / 1000;

				if (secondsSinceLastEpisodeUpdateToServer > get().updateProgressSecondsConfig) {
					shouldUpdateToServer = true;
				}
			}

			if (shouldUpdateToServer) {
				console.log('Updating progress to server');
				get().synchronizeEpisodeState();
			}
		}
		set(
			produce((state) => {
				state.podcasts[activePodcast.path].episodes[activeEpisode.guid].currentTime = newProgress;
				state.podcasts[activePodcast.path].episodes[activeEpisode.guid].duration = newDuration;
				state.podcasts[activePodcast.path].episodes[activeEpisode.guid].listenedPercentage = listenedPercentage;

				
				

				if (secondsLeft < 20 || listenedPercentage > 95) {
					state.podcasts[activePodcast.path].episodes[activeEpisode.guid].listened = true;
				}

				if (newProgress > 10) {
					if (!state.continueListeningEpisodeList) {
						state.continueListeningEpisodeList = [];
					}
					const index = state.continueListeningEpisodeList.findIndex(continueListeningEpisode => continueListeningEpisode.episodeGuid === activeEpisode.guid);

					// If the episode is already in there, and not the first, let's remove it
					if ((index !== -1 && index !== 0) || (index === 0 && (secondsLeft < 20 || listenedPercentage > 95))) {
						state.continueListeningEpisodeList.splice(index,1);
					}


					// We don't want to (re)add the episode if it's already listened
					if (secondsLeft >= 20 && listenedPercentage <= 95) {
						// If episode is not in there (which means we're going to add it), and the list is larger than our max, we remove one element
						if (index === -1 && state.continueListeningEpisodeList.length > state.continueListeningEpisodeListMaxSize) {
							state.continueListeningEpisodeList.pop();
						}
						// If the index is 0, we will just update the dateListened. But if not, we'll add the episode.
						if (index === 0) {
							state.continueListeningEpisodeList[index].dateListened = new Date();
						}
						if (index !== 0) {
							state.continueListeningEpisodeList.unshift({
								podcastPath: activePodcast.path,
								dateListened: new Date(),
								episodeGuid: activeEpisode.guid,
								title: activeEpisode.title,
								image: activeEpisode.image,
								description: activeEpisode.descriptionNoHTML.substring(0,100)
							})
						}
					}
					
					/*
					if (!(state.continueListeningEpisodeList.length > 0 && state.continueListeningEpisodeList[0].episodeGuid === activeEpisode.guid)) {
						var found = false;
						state.continueListeningEpisodeList.forEach((continueListeningEpisode,index) => {
							if (continueListeningEpisode.guid === activeEpisode.guid) {
								found = index;
							}
						});
						if (found) {
							state.continueListeningEpisodeList.splice(index,1);
						}
						// state.continueListeningEpisodeList = state.continueListeningEpisodeList.filter(checkEpisode => checkEpisode.guid !== activeEpisode.guid);

						state.continueListeningEpisodeList.unshift({
							podcastPath: activePodcast.path,
							dateListened: new Date(),
							episodeGuid: activeEpisode.guid,
							title: activeEpisode.title,
							image: activeEpisode.image,
							description: activeEpisode.descriptionNoHTML.substring(0,100)
						})
					}
					*/
				}

					// get().addEpisodeToContinueListeningList(activePodcastCopy,activeEpisodeCopy);
				/*
				const episodeIndex = state.activePodcast.episodes.findIndex((el) => el.guid === activeEpisode.guid);
				if (found) {
					state.continueListeningEpisodeList[found].currentTime = newProgress;
				}
				state.podcasts[activePodcast.path].episodes[episodeIndex].currentTime = newProgress;
				state.podcasts[activePodcast.path].episodes[episodeIndex].duration = newDuration;
				state.podcasts[activePodcast.path].episodes[episodeIndex].listenedPercentage = listenedPercentage;

				state.activeEpisode.currentTime = newProgress;
				state.activeEpisode.duration = newDuration;
				state.activeEpisode.listenedPercentage = listenedPercentage;
				if (secondsLeft < 20 || listenedPercentage > 95) {
					state.activeEpisode.listened = true;
					state.activePodcast.episodes[episodeIndex].listened = true;
				}
				*/
			})
		)
	},
	/**********************************************************************************
	* Episode related
	***********************************************************************************/
	goToNextEpisode: () => {

	},
	/**********************************************************************************
	* Value 4 Value related
	***********************************************************************************/
	__audioSegmentIntervalId: false,
	playingSegmentCurrentTime: false,
	resetPlayingSegmentTime: () => {
		console.log('resetPlayingSegmentTime');
		var audioController = get().audioController;

		if (audioController) {
			set({
				playingSegmentCurrentTime: audioController.getCurrentTime()
			});
			get().startNewPlayingSegmentTimer();
		}
	},
	stopPlayingSegmentTime: () => {
		console.log('stopPlayingSegmentTime');
		clearInterval(get().__audioSegmentIntervalId);
	},
	startNewPlayingSegmentTimer: () => {
		console.log('startNewPlayingSegmentTimer');
		clearInterval(get().__audioSegmentIntervalId);

		var newIntervalId = setInterval(() => {
			get().playingSegmentTimeTrigger();
		// },5000);
		},60000);
		set({
			__audioSegmentIntervalId: newIntervalId
		});
	},
	playingSegmentTimeTrigger: () => {
		get().streamValue();
	},
	/**********************************************************************************
	* Active podcast states
	***********************************************************************************/
	activePodcastPath: false,
	activeEpisodeGuid: false,
	activePodcast: false,
	activeEpisode: false
});