import WebAudioController from './WebAudioController.js';

import { MusicControls } from '@awesome-cordova-plugins/music-controls';

import useStore from 'store/Store';

class HybridMobileAudioController extends WebAudioController {
	useBrowserAudioElement = true;

	/**
	*
	*/
	constructor() {
		super();
		this._currentPositionTimerId = false;
		this.musicControls = MusicControls;
		this.coverServerURL = 'https://podcastcovers.podfriend.com/';
	}
	init() {
		console.log('HybridMobileAudioController:init');
	}
	/**
	 * Updates the currentPosition state
	 * @private
	 */
	__refreshCurrentPosition() {
		var currentPosition = this.getCurrentTime();
		this.__setInternalCurrentPosition(currentPosition)
	}
	/**
	*
	**/
	__setInternalCurrentPosition(timeInSeconds) {
		if (this.musicControlsInitialized) {
			this.musicControls.updateElapsed({
				elapsed: timeInSeconds,
				isPlaying: useStore.getState().shouldPlay
			});
		}
	}
	/**
	*
	*/
	setCurrentTime(newTime) {
		ParentClass.prototype.setCurrentTime(newTime);

		this.__setInternalCurrentPosition(newTime);

		return Promise.resolve(true);
	}
	/**
	*
	*/
	getCurrentTime() {
		return this.audioElement.currentTime;
	}
	/**
	*
	*/
	getDuration() {
		return this.audioElement.duration;
	}
	pause() {
		if ('mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "paused";
		}
		this.musicControls.updateIsPlaying(false);
		this.musicControls.updateElapsed({
			elapsed: this.getCurrentTime(),
			isPlaying: false
		});
		this.audioElement.pause();
		return Promise.resolve(true);
	}
	load() {
		this.audioElement.load();
		return Promise.resolve(true);
	}
	play() {
		var returnValue = this.audioElement.play();

		this.__refreshCurrentPosition();

		clearInterval(this._currentPositionTimerId);
		this._currentPositionTimerId = setInterval(this.__refreshCurrentPosition.bind(this), 1000);

		if (this.musicControlsInitialized) {
			this.musicControls.updateIsPlaying(true);
		}

		if (returnValue.then) {
			if ('mediaSession' in navigator) {
				navigator.mediaSession.playbackState = "playing";
			}
			return returnValue.then;
		}


		return Promise.resolve(true);
	}
	/**
	* 
	*/
	__createMediaControls(podcast,episode) {
		var coverUrl = this.coverServerURL + podcast.path + '/' + '600x600/' + encodeURI(episode.image ? episode.image : podcast.image);

		this.musicControls.create({
			track: episode.title,
			artist: podcast.author,
			album: podcast.name,
			cover: coverUrl,
			isPlaying: this.player.props.isPlaying,
			dismissable: true,
			hasPrev: true,
			hasNext: true,
			hasClose: true,
			// iOS only, optional
			duration: this.player.state.duration,
			elapsed: this.player.state.progress,
			hasSkipForward: true, // true value overrides hasNext.
			hasSkipBackward: true, // true value overrides hasPrev.
			skipForwardInterval : 15,
			skipBackwardInterval : 15,
			hasScrubbing : true,
			ticker: 'Now playing ' + episode.title,
		}, () => {
			console.log('MusicControls success!');
		},() => {
			console.log('MusicControls error!');
		});

		this.musicControls
		.subscribe()
		.subscribe((action) => {
			const message = JSON.parse(action).message;
			
			switch(message) {
				case 'music-controls-next':
					console.log('music-controls-next');
					this.player.onNextEpisode();
					break;
				case 'music-controls-previous':
					console.log('music-controls-previous');
					this.player.onPrevEpisode();
					break;
				case 'music-controls-pause':
					console.log('music-controls-pause');
					useStore.getState().audioPause();
					break;
				case 'music-controls-play':
					console.log('music-controls-play');
					useStore.getState().audioPlay();
					break;
				case 'music-controls-destroy':
					console.log('music-controls-destroy - the user probably swiped it away!');
					useStore.getState().audioPause();
					break;
		
				// External controls (iOS only)
				case 'music-controls-toggle-play-pause' :
					console.log('music-controls-toggle-play-pause');
					break;
				case 'music-controls-seek-to':
					console.log('music-controls-seek-to');
					const seekToInSeconds = JSON.parse(action).position;

					this.player.setCurrentTime(seekToInSeconds * 1000);

					this.musicControls.updateElapsed({
						elapsed: seekToInSeconds,
						isPlaying: true
					});
					break;
				case 'music-controls-skip-forward':
					console.log('music-controls-skip-forward');
					useStore.getState().audioForward();
					break;
				case 'music-controls-skip-backward':
					console.log('music-controls-skip-backward');
					useStore.getState().audioBackward();
					break;
				// Headset events (Android only)
				// All media button events are listed below
				case 'music-controls-media-button':
					console.log('music-controls-media-button');
					// Do something
					break;
				case 'music-controls-headset-unplugged':
					console.log('music-controls-headset-unplugged');
					// Do something
					break;
				case 'music-controls-headset-plugged':
					console.log('music-controls-headset-plugged');
					// Do something
					break;
				default:
					break;
			}
		});
		this.musicControls.listen();
	}
	setEpisode(podcast,episode) {
		var sizes = [20,120,400,600,800];

		var coverSizes = [];

		for(var i=0;i<sizes.length;i++) {
			coverSizes.push({
				src: (this.coverServerURL + podcast.path + '/' + sizes[i] + 'x' + sizes[i] + '/' + encodeURI(episode.image ? episode.image : podcast.image)),
				sizes: sizes[i] + 'x' + sizes[i],
				type: 'image/jpg'
			});
		}

		this.playingTrack = {
			title: episode.title,
			artist: podcast.author,
			album: podcast.name,
			artwork: coverSizes
		};

		if ('mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata(this.playingTrack);
		}

		this.__createMediaControls(podcast,episode);

		return Promise.resolve(true);
		/*
		return new Promise(() => {
			return true;
		});
		*/
	}
	destroy() {
		
	}
}
export default HybridMobileAudioController;