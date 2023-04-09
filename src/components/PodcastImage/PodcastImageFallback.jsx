import React, { useState,useEffect } from 'react';

import useDimensions from 'hooks/useDimensions';
import { callbackify } from 'util';

const randomColorGen = require('randomcolor');

const PodcastImageFallback = ({ podcastId, podcastPath, imageSource, imageErrorText, originalSource, className, isError, width, coverWidth, coverHeight }) => {
	const [randomColor,setRandomColor] = useState('#EEEEEE');
	const [randomColor2,setRandomColor2] = useState('#EEEEEE');
	const [fontColor,setFontColor] = useState('#999999');
	const [fontSize,setFontSize] = useState(12);

	const [fallbackElement, { x, y, width: elementWidth }] = useDimensions();

	useEffect(() => {
		if (isError) {
			if (podcastPath || imageSource) {
				var randColorgen = randomColorGen({
					seed: podcastPath ? podcastPath : imageSource,
					luminosity: 'bright'
				});

				var randColor2gen = randomColorGen({
					seed: podcastPath ? podcastPath : imageSource,
					luminosity: 'light'
				});

				setRandomColor(randColorgen);
				setRandomColor2(randColor2gen);
			}
			setFontColor('#000000');
		}
		
		setFontSize(Math.round(width / 12));
	},[]);

	return (
		<div
			ref={fallbackElement}
			style={{
				backgroundColor: randomColor2,
				/* background: 'linear-gradient(0deg,' + randomColor + ' 0% ,' + randomColor2 + ' 100%)', */
				overflow: 'hidden',
				justifyContent: 'center',
				fontWeight: 'bold',
				display: 'flex',
				alignItems: 'center',
				textAlign: 'center',
				color: fontColor,
				fontSize: fontSize > 20 ? 24 : fontSize,
				width: coverWidth,
				height: coverHeight,
				contentVisibility: 'auto'
			}}
			className={className + ' fallBack'} originalsource={originalSource}>
				<div className="fallBack">
					{imageErrorText}
				</div>
		</div>
	);
};

export default PodcastImageFallback;