import structuredClone from '@ungap/structured-clone';

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
	playbackSpeed: 1,
	/**********************************************************************************
	* Audio functions
	***********************************************************************************/
	playEpisode: async (podcast,episodeUrl,live = false, podcastPath = false) => {
		// console.log(podcast);
		// console.log(episodeUrl);
		episodeUrl = episodeUrl.url ? episodeUrl.url : episodeUrl;

		// console.log('podcast');
		// console.log(podcast);

		if (!podcast) {
			podcast = await get().getPodcast(podcastPath);
		}

		const activePodcast = get().activePodcast;

		// console.log('activePodcast');
		// console.log(activePodcast);

		if (podcast.path === activePodcast.path) {
			console.log('podcast was the active podcast');
			podcast = structuredClone(activePodcast);
		}
		let episode = false;

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
			// console.log(podcast);
			episode = get().getEpisodeByUrl(podcast,episodeUrl);

			console.log('Playing episode');
			console.log(episode);

			if (!episode) {
				console.log('Episode not found?');
				console.log(episodeUrl);
				console.log(podcast);
				return;
			}
			if (episode.listened === true) {
				// episode.currentTime = 0;
				// Todo, update online here too.
			}
		}

		get().updateFollowedPodcastListeningDate(podcast);
		get().updatePodcastAttributes({
			podcastData: podcast,
			attributes: {
				lastListened: new Date()
			}
		});

		// console.log(podcast);

		var currentTime = episode.currentTime;

		set({
			activePodcast: podcast,
			activeEpisode: episode,
			shouldPlay: true,
			loading: true
		});
		setTimeout(() => {
			get().audioSetCurrentTime(currentTime);
		},50);
		// get().addEpisodeToContinueListeningList(podcast,episode);
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
			get().resetAudioSegmentTime();
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
			get().resetAudioSegmentTime();
			/*
			audioController.pause()
			.then(() => {
				return audioController.setCurrentTime(backwardTime);
			})
			.then(() => {
				if (get().shouldPlay) {
					audioController.play();
					get().resetAudioSegmentTime();
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
				audioController.setCurrentTime(currentTime + audioForwardIncrement);
				state.resetAudioSegmentTime();
				/*
				audioController.pause()
				.then(() => {
					return audioController.setCurrentTime(currentTime + audioForwardIncrement);
				})
				.then(() => {
					if (state.shouldPlay) {
						audioController.play();
						state.resetAudioSegmentTime();
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

		var foundNextEpisode = false;
		var nextEpisodeIsAfterCurrent = false;

		console.log(activePodcast);

		if (activePodcast.configSelectedSortOrder === 'old') {
			for(var i=0;i<activePodcast.episodes.length;i++) {
				if (nextEpisodeIsAfterCurrent) {
					if (activePodcast.episodes[i].episodeType !== 'trailer') {
						console.log('found it!');
						foundNextEpisode = true;
						get().playEpisode(activePodcast,activePodcast.episodes[i].url);
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
						get().playEpisode(activePodcast,activePodcast.episodes[i].url);
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

		var percentage = (100 * audioController.getCurrentTime()) / audioController.getDuration();

		if (percentage > 75) {
			get().markEpisodeAsListened(activePodcast,activeEpisode);
		}

		var foundNextEpisode = false;
		var nextEpisodeIsAfterCurrent = false;

		console.log(activePodcast);

		if (activePodcast.configSelectedSortOrder === 'old') {
			for(var i=activePodcast.episodes.length - 1;i>0;i--) {
				if (nextEpisodeIsAfterCurrent) {
					if (activePodcast.episodes[i].episodeType !== 'trailer') {
						console.log('found it!');
						foundNextEpisode = true;
						console.log(activePodcast);
						console.log(activePodcast.episodes[i]);
						get().playEpisode(activePodcast,activePodcast.episodes[i].url);
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
						get().playEpisode(activePodcast,activePodcast.episodes[i].url);
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
	},
	changeActiveEpisode: (podcast,episode) => {
		var audioController = get().audioController;
		
		if (audioController) {
			audioController.pause()
			.then(() => {
				audioController.setEpisode(podcast,episode)
				.then(() => {
					audioController.load()
					.then(() => {
						var currentTime = 0;

						if (episode.currentTime) {
							var percentageListened = (100 * episode.currentTime) / episode.duration;
							
							if (percentageListened < 95) {
								currentTime = episode.currentTime;
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
				get().changeActiveEpisode(podcast,episode);
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
		let newDuration = get().audioController.getDuration();
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
		set({
			streamDataLoading: false
		});
	},
	/**********************************************************************************
	* Episode related
	***********************************************************************************/
	goToNextEpisode: () => {

	},
	/**********************************************************************************
	* Value 4 Value related
	***********************************************************************************/
	resetAudioSegmentTime: () => {

	},
	/**********************************************************************************
	* Active podcast states
	***********************************************************************************/
	activePodcast: false,
	activeEpisode: false
});