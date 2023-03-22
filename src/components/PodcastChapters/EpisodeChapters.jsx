import React, { useEffect, useState } from 'react';

import EpisodeChapter from './EpisodeChapter.jsx';

import './EpisodeChapters.scss';

var randomColor = require('randomcolor');

const EpisodeChapters = ({ audioController, chapters, progress, episodeCover, currentChapter }) => {
	const [fadeOutChapter,setFadeoutChapter] = useState(false);
	const [activeChapter,setActiveChapter] = useState(false);

	useEffect(() => {
		if (!currentChapter) {
			return;
		}
		if (activeChapter !== currentChapter) {
			setFadeoutChapter(activeChapter);
		}
		setActiveChapter(currentChapter);
		if (currentChapter.img && audioController) {
			audioController.setCoverImage(currentChapter.img);
		}
		else if (audioController) {
			audioController.restoreCoverImage();
		}

		// console.log('new current Chapter: ');
		// console.log(currentChapter);
	},[currentChapter.startTime]);

	/*
	useEffect(() => {
		var foundChapter = false;

		if (progress > 0) {
			// First we walk through to find the active chapter
			for(var i=0;i<chapters.length;i++) {
				if (chapters[i].startTime <= progress) {
					// Let's make sure we get the latest chapter
					if (!foundChapter || foundChapter.startTime < chapters[i].startTime) {
						foundChapter = chapters[i];
					}
				}
			}
		}
		if (foundChapter != currentChapter) {
			setFadeoutChapter(currentChapter);
			setCurrentChapter(foundChapter);
		}
	},[chapters,progress]);
	*/

/*
	if (chapters && chapters.length > 0) {
		if (currentChapter) {
			return (
				<EpisodeChapter
					key={(currentChapter.startTime + ':' + currentChapter.title + ':' + currentChapter.img + ':' + currentChapter.url)}
					startTime={currentChapter.startTime}
					fadeOut={currentChapter === fadeOutChapter}
					isActive={true}
					title={currentChapter.title}
					url={currentChapter.url}
					image={currentChapter.img}
				/>
			);
		}
		else {
			return episodeCover;
		}
	}
	else {
		return null;
	}
	*/
	if (chapters && chapters.length > 0) {
		return (
			<>
				{ chapters.map((chapter) => {
					var chapterImage = chapter.img ? chapter.img : episodeCover;
					const isActive = chapter.startTime === activeChapter.startTime;

						return (
							<EpisodeChapter
								key={(chapter.startTime + ':' + chapter.title + ':' + chapter.img + ':' + chapter.url)}
								startTime={chapter.startTime}
								fadeOut={chapter === fadeOutChapter}
								isActive={isActive}
								title={chapter.title}
								url={chapter.url}
								image={chapterImage}
							/>
						);
				})}
			</>
		);
	}
	else {
		return null;
	}
};
export default EpisodeChapters;