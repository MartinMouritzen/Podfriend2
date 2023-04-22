import AudioController from './AudioController.js';

class WebAudioController extends AudioController {
	useBrowserAudioElement = true;
	browserShortcutsEnabled = true;

	/**
	*
	*/
	constructor() {
		super();
		this.audioElement = false;
	}
	startService() {
		
	}
	init() {
		if (this.browserShortcutsEnabled && 'mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "none";

			try { navigator.mediaSession.setActionHandler('play',() => { this.play(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('pause',() => { this.pause(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('stop',() => { this.pause(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('seekbackward',() => { this.rewind(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('seekforward',() => { this.forward(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('seekto',() => { this.setCurrentTime(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('previoustrack',() => { this.previousTrack(); }); } catch (exception) { console.log('media exception: ' + exception); }
			try { navigator.mediaSession.setActionHandler('nexttrack',() => { this.nextTrack(); }); } catch (exception) { console.log('media exception: ' + exception); }
		}
	}
	/**
	*
	*/
	setAudioElement(audioElement) {
		this.audioElement = audioElement;
	}
	/**
	*
	*/
	setCoverImage(src) {
		if (this.browserShortcutsEnabled && 'mediaSession' in navigator) {
			var trackClone = {...this.playingTrack};
			trackClone.artwork = [{
				src: src,
				sizes: '200x200',
				type: 'image/png'
			}];

			// console.log('setting cover image');
			// console.log(trackClone);

			navigator.mediaSession.metadata = new MediaMetadata(trackClone);
		}
	}
	/**
	*
	*/
	restoreCoverImage() {
		if (this.browserShortcutsEnabled && 'mediaSession' in navigator) {
			console.log('restoring cover image');
			navigator.mediaSession.metadata = new MediaMetadata(this.playingTrack);
		}
	}
	/**
	*
	*/
	setPlaybackRate(playbackRate) {
		if (this.audioElement && this.audioElement) {
			if (!playbackRate || Number.isNaN(playbackRate)) {
				playbackRate = 1;
			}
			try {
				this.audioElement.playbackRate = playbackRate;
			}
			catch(exception) {
				console.log('Error happened in WebAudioController.setPlaybackRate');
				console.log(playbackRate);
				console.log(exception);
			}
		}
	}
	/**
	*
	*/
	setCurrentTime(newTime) {
		if (this.audioElement) {
			if (isNaN(newTime)) {
				return Promise.resolve(true);
			}
			this.audioElement.currentTime = newTime;
		}
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
		if (this.browserShortcutsEnabled && 'mediaSession' in navigator) {
			navigator.mediaSession.playbackState = "paused";
		}
		try {
			this.audioElement.pause();
		}
		catch (exception) {
			console.log('Pause exception');
		}
		return Promise.resolve(true);
	}
	load() {
		this.audioElement.load();
		return Promise.resolve(true);
	}
	play() {
		try {
			var returnValue = this.audioElement.play()
			if (returnValue.then) {
				if (this.browserShortcutsEnabled && 'mediaSession' in navigator) {
					navigator.mediaSession.playbackState = "playing";
				}
				return returnValue;
			}
		}
		catch (exception) {
			console.log('Play exception');
		}
		return Promise.resolve(true);
	}
	setVolume(newVolume) {
		this.audioComponent.volume = newVolume;
	}
	getVolume() {
		return this.audioComponent.volume;
	}
	setEpisode(podcast,episode) {
		const coverPath = 'https://podcastcovers.podfriend.com/' + podcast.path + '/';

		var sizes = [20,120,400,600,800];

		var coverSizes = [];

		for(var i=0;i<sizes.length;i++) {
			coverSizes.push({
				src: (coverPath + sizes[i] + 'x' + sizes[i] + '/' + encodeURI(episode.image ? episode.image : podcast.image)),
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

		if (this.browserShortcutsEnabled && 'mediaSession' in navigator) {
			navigator.mediaSession.metadata = new MediaMetadata(this.playingTrack);
		}

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
export default WebAudioController;