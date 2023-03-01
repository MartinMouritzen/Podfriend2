import useStore from 'store/Store';

import { useState, useEffect, useRef } from "react";

import PodcastImage from 'components/PodcastImage/PodcastImage';
import { IonSkeletonText } from '@ionic/react';
import EpisodeChapters from 'components/PodcastChapters/EpisodeChapters';

const PlayerPodcastCoverArea = ({ audioController }) => {
	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	const [rssFeedCurrentEpisode,setRssFeedCurrentEpisode] = useState(false);
	const [chapters,setChapters] = useState(false);
	const [subtitleFileURL,setSubtitleFileURL] = useState(false);

	const fullscreen = useStore((state) => state.playerFullscreen);

	const podcastImageURL = activeEpisode.image ? activeEpisode.image : activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image;

	useEffect(() => {
		setRssFeedCurrentEpisode(false);

		if (activePodcast.rssFeedContents) {
			var foundEpisode = false;

			for(var i=0;i<activePodcast.rssFeedContents.items.length;i++) {
				if (activeEpisode.guid == activePodcast.rssFeedContents.items[i].guid) {
					foundEpisode = true;
					setRssFeedCurrentEpisode(activePodcast.rssFeedContents.items[i]);
					break;
				}
			}
		}
	},[activeEpisode]);

	useEffect(() => {
		if (rssFeedCurrentEpisode && rssFeedCurrentEpisode.chaptersUrl) {
			loadChapters(rssFeedCurrentEpisode.chaptersUrl);
		}
	},[rssFeedCurrentEpisode]);

	/*
	const defaultVibrantColor = 'rgba(41, 121, 255, 1)';
	const defaultDarkVibrantColor = 'rgba(23,78,161,1)';
	const [vibrantColor,setVibrantColor] = useState(defaultVibrantColor);
	const [darkVibrantColor,setDarkVibrantColor] = useState(defaultDarkVibrantColor);

	const coverImageRef = useRef(null);

	const vibrantColorsLoaded = () => {
		try {
			var vibrant = new Vibrant(coverImageRef.current);
			var swatches = vibrant.swatches();

			var useKey = 'DarkVibrant';
			setDarkVibrantColor(`rgba(${swatches[useKey]['rgb'][0]},${swatches[useKey]['rgb'][1]},${swatches[useKey]['rgb'][2]},1`);
			useKey = 'Vibrant';
			setVibrantColor(`rgba(${swatches[useKey]['rgb'][0]},${swatches[useKey]['rgb'][1]},${swatches[useKey]['rgb'][2]},1`);
		}
		catch (exception) {
			console.log('Vibrant exception');
			console.log(exception);
		}
	};

	useEffect(() => {
		setDarkVibrantColor(defaultDarkVibrantColor);
		setVibrantColor(defaultVibrantColor);

		if (coverImageRef.current) {
			coverImageRef.current.crossOrigin = 'anonymous';
			if (coverImageRef.current.complete && coverImageRef.current.naturalHeight !== 0) {
				vibrantColorsLoaded();
			}
			coverImageRef.current.addEventListener('load',() => {
				vibrantColorsLoaded();
			});
		}
	},[coverImageRef.current]);
	*/

	const loadChapters = async(url) => {
		// console.log('loading chapters');
		let result = false;

		try {
			result = await fetch(url);
		}
		catch(exception) {
			// console.error('Cors probably missing on chapters, using proxy');
			url = 'https://www.podfriend.com/tmp/rssproxy.php?rssUrl=' + encodeURI(url);

			try {
				result = await fetch(url);
			}
			catch(exception2) {
				console.error('Proxy call to chapters failed.');
				console.error(exception2);
			}
		}
		try {
			let resultJson = await result.json();

			try {
				if (resultJson.chapters && resultJson.chapters.length > 0) {
					setChapters(resultJson.chapters);
				}
			}
			catch(exception) {
				console.error('Exception getting chapters from: ' + url);
				console.error(exception);
			}
		}
		catch(exception) {
			console.error('Exception parsing chapters');
			console.error(exception);
			console.error(url);
			console.error(result);
		}
	};

	return (
		<>
			{ (fullscreen && chapters !== false) &&
				<EpisodeChapters audioController={audioController} chapters={chapters} progress={activeEpisode.currentTime} />
			}
			{ false &&
				<PodcastImage
					podcastPath={activePodcast.path}
					width={600}
					height={600}
					coverWidth={50}
					coverHeight={50}
					imageErrorText={activePodcast.name}
					fallBackImage={activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
					src={podcastImageURL}
					className={''}
					// imageRef={coverImageRef}
					loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
				/>
			}
			
		</>
	);
}
export default PlayerPodcastCoverArea;