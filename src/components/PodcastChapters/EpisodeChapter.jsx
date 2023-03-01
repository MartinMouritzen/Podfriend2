import React, { useEffect, useState } from 'react';

var randomColor = require('randomcolor');

const EpisodeChapter = ({ title, image, url, isActive, fadeOut }) => {
	const chapterRandomColor = randomColor({
		seed: title ? title : image ? image : url,
		luminosity: 'light',
		hue: 'blue'
	});

	return (
		<div
			className={
				'chapter' + ' ' + (isActive ? 'activeChapter' : '') + (fadeOut ? 'fadeOut' : '')}
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

export default EpisodeChapter;