import React, { useEffect, useState, memo } from 'react';

var randomColor = require('randomcolor');

const EpisodeChapter = ({ title, image, url, isActive, fadeOut }) => {
	const chapterRandomColor = randomColor({
		seed: title ? title : image ? image : url,
		luminosity: 'light',
		hue: 'blue'
	});

	return <img src={image} className={'chapter' + ' ' + (isActive ? 'activeChapter' : '')} />;

	return (
		<div
			className={
				'chapter' + ' ' + (isActive ? 'activeChapter' : '')}
				style={{
					backgroundColor: (!url && !image) ? chapterRandomColor : 'transparent'
				}}
			>
			{ (!url && !image) &&
				<div className='chapterTitleFull'>
					{title}
				</div>
			}
			{ (url || image) &&
				<div className='chapterTitleHeader'>
					{title}
				</div>
			}
			{ url &&
				<div className='linkContainer'>
					<a href={url} target="_blank">{url}</a>
				</div>
			}
			{ image && 
				<div className='chapterImageOuter' style={{ backgroundImage: 'url("' + image + '")' }}>
					<div className='chapterImageInner' style={{ backgroundImage: 'url("' + image + '")' }}>
						&nbsp;
					</div>
				</div>
			}
		</div>
	);
};

function chapterShouldCache(prevEpisode,nextEpisode) {
	if (nextEpisode.isActive != prevEpisode.isActive) { return false; }
	
	return true;
}

// export default EpisodeChapter;
export default memo(EpisodeChapter, chapterShouldCache);