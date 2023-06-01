import useStore from 'store/Store';

import { useState, useEffect, useRef } from "react";

import PodcastImage from 'components/PodcastImage/PodcastImage';
import { IonSkeletonText } from '@ionic/react';
import EpisodeChapters from 'components/PodcastChapters/EpisodeChapters';

const PlayerPodcastCoverArea = ({ audioController, chapters = false, currentChapter = false, podcast, episode }) => {
	if (!podcast || !episode) {
		return (
			<div className='chapers'>
				<IonSkeletonText animated={true} className={'chapter'} />
			</div>
		);
	}

	const podcastImageURL = episode.image ? episode.image : podcast.artworkUrl600 ? podcast.artworkUrl600 : podcast.image;



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




	return (
		<div className="chapters">
			<PodcastImage
				podcastPath={podcast.path}
				width={600}
				height={600}
				coverWidth={400}
				coverHeight={400}
				imageErrorText={podcast.name}
				fallBackImage={podcast.artworkUrl600 ? podcast.artworkUrl600 : podcast.image}
				src={podcastImageURL}
				className={''}
				// imageRef={coverImageRef}
				loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
			/>
			{ chapters !== false &&
				<EpisodeChapters audioController={audioController} chapters={chapters} progress={episode.currentTime} currentChapter={currentChapter} />
			}
		</div>
	);
}
export default PlayerPodcastCoverArea;