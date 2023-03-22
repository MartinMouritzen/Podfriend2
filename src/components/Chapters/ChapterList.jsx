import { IonItem, IonLabel, IonList, IonListHeader, IonThumbnail } from "@ionic/react";

import { memo } from 'react';

import useStore from 'store/Store';

import TimeUtil from "library/TimeUtil";

import './ChapterList.scss';

const ChapterList = ({ chapters, currentChapter = false }) => {
	if (!chapters) {
		return;
	}
	const audioSetCurrentTime = useStore((state) => state.audioSetCurrentTime);

	return (
		<IonList lines="full" className="chapterList">
			<IonListHeader>
				<IonLabel>Chapters</IonLabel>
			</IonListHeader>
			{ chapters.map((chapter) => {
				return (
				<IonItem detail={true} onClick={() => { audioSetCurrentTime(chapter.startTime) }} className={currentChapter === chapter ? 'currentChapter' : ''}>
					{ chapter.img &&
						<IonThumbnail slot="start" className="chapterListThumbnail">
							<img src={chapter.img} />
						</IonThumbnail>
					}
					<IonLabel className="chapterTitle ion-text-wrap">
						{chapter.title}
					</IonLabel>
					<div className="timeMarker">
						{TimeUtil.fancyTimeFormat(chapter.startTime)}
						{ chapter.endTime &&
							<> - {TimeUtil.fancyTimeFormat(chapter.endTime)}</>
						}
					</div>
				</IonItem>
				);
			} ) }
		</IonList>
	);
}

function chapterListShouldCache(prevList,nextList) {
	if (nextList.currentChapter != prevList.currentChapter) { return false; }
	
	return true;
}

export default memo(ChapterList, chapterListShouldCache);
// export default ChapterList;