import { IonButton, IonButtons, IonContent, IonFooter, IonHeader, IonIcon, IonLabel, IonModal, IonSearchbar, IonTitle, IonToggle, IonToolbar } from '@ionic/react';

import { memo, useState, useRef, useEffect } from 'react';

var randomColor = require('randomcolor');

import {
	play as playIcon,
	pause as pauseIcon
} from 'ionicons/icons';

import StringUtil from 'library/StringUtil';

import './TranscriptLiveArea.scss';
import { set } from 'date-fns';
import TranscriptSegment from './TranscriptSegment';

import useStore from 'store/Store';
import ChapterSegment from './ChapterSegment';

const TranscriptLiveArea = ({ transcriptData, rssFeedCurrentEpisode, currentTime, podcast, setCurrentTime, chapters }) => {
	const page = useRef(null);
	const modal = useRef(null);
	const contentNodeRef = useRef(null);
	const [presentingElement, setPresentingElement] = useState(null);
	const [persons,setPersons] = useState(podcast?.rssFeedContents?.persons);
	const [episodePersons,setEpisodePersons] = useState(rssFeedCurrentEpisode?.persons);
	const [speakers,setSpeakers] = useState(false);
	const [segments,setSegments] = useState(false);
	const [searchQuery,setSearchQuery] = useState('');
	const [autoScroll,setAutoScroll] = useState(true);

	const audioPlay = useStore((state) => state.audioPlay);
	const audioPause = useStore((state) => state.audioPause);
	const shouldPlay = useStore((state) => state.shouldPlay);

	useEffect(() => {
		setPresentingElement(page.current);
	}, []);

	const openModal = () => {
		modal.current?.present();
	}
	const closeModal = () => {
		modal.current?.dismiss();
	}

	var lastSpeaker = false;

	useEffect(() => {
		setPersons(false);
		if (podcast && podcast.rssFeedContents && podcast.rssFeedContents.persons) {
			setPersons(podcast.rssFeedContents.persons);
		}
	},[JSON.stringify(podcast?.rssFeedContents?.persons)]);

	useEffect(() => {
		setEpisodePersons(false);
		if (rssFeedCurrentEpisode && rssFeedCurrentEpisode.persons) {
			setEpisodePersons(rssFeedCurrentEpisode.persons);
		}
	},[JSON.stringify(rssFeedCurrentEpisode?.persons)]);

	useEffect(() => {
		setSegments(false);
		var newSegments = [];
		var currentSegment = false;
		var currentSpeaker = false;

		var lastPosition = 'right';

		var newSpeakers = {};
		var addedSpeaker = false;

		for(var i=0;i<transcriptData.length;i++) {
			var segment = transcriptData[i];

			if (segment.speaker && segment.speaker !== currentSpeaker) {
				if (!newSpeakers[segment.speaker]) {
					addedSpeaker = true;
					var avatar = false;
					var role = false;
					if (persons || episodePersons) {
						for(var x=0;x<persons.length;x++) {
							if (persons[x]["#text"] == segment.speaker) {
								avatar = persons[x].img;
								role = persons[x].role;
							}
						}
						for(var x=0;x<episodePersons.length;x++) {
							if (episodePersons[x]["#text"] == segment.speaker) {
								avatar = episodePersons[x].img;
								role = episodePersons[x].role;
							}
						}
					}
					else {
						console.log('No persons to take avatars from');
						console.log(persons);
						console.log(segment.speaker);
					}
					newSpeakers[segment.speaker] = {
						name: segment.speaker,
						initials: StringUtil.getInitials(segment.speaker),
						avatar: avatar,
						role: role,
						color: randomColor({
							seed: segment.speaker,
							luminosity: 'bright',
							format: 'rgba',
							alpha: 0.8
						}),
						position: lastPosition === 'right' ? 'left' : 'right'
					};
					lastPosition = newSpeakers[segment.speaker].position;
				}
				if (currentSegment) {
					newSegments.push(currentSegment);
				}
				currentSegment = false;
			}
			else if (!segment.speaker) {
				if (currentSegment) {
					newSegments.push(currentSegment);
					currentSegment = false;
				}
			}
			if (!currentSegment) {
				currentSegment = {
					speaker: segment.speaker,
					startTime: parseFloat(segment.startTime),
					endTime: parseFloat(segment.endTime),
					lines: []
				};
			}
			currentSpeaker = segment.speaker;

			if (segment.endTime > currentSegment.endTime) {
				currentSegment.endTime = parseFloat(segment.endTime);
			}
			currentSegment.lines.push(segment);
		}
		if (chapters) {
			chapters.forEach((chapter) => {
				newSegments.push(chapter);					
			});
		}
		newSegments.push(currentSegment);

		if (addedSpeaker) {
			setSpeakers(newSpeakers);
		}

		const compareSegments = (a,b) => {
			if (a.startTime < b.startTime ){
				return -1;
			}
			if ( a.startTime > b.startTime ){
				return 1;
			}
			return 0;
		};
		
		newSegments.sort(compareSegments);

		setSegments(newSegments);

	},[JSON.stringify(transcriptData.length)]);

	const scrollToElement = () => {
		if (autoScroll && contentNodeRef && contentNodeRef.current) {
			var activeLine = document.querySelectorAll('.line.active');
			
			if (activeLine && activeLine.length && activeLine[0]) {
				contentNodeRef.current.getScrollElement()
				.then((scrollElement) => {
					contentNodeRef.current.scrollToPoint(0,activeLine[0].offsetTop - 200);
				});
			}
		}
	};

	useEffect(() => {
		scrollToElement();
	},[Math.round(currentTime)]);

	const searchBar = useRef(null);

	const onSearch = (event) => {
		if (searchBar.current) {
			setSearchQuery(searchBar.current.value.toLowerCase());
		}
		return false;
	};

	return (
		<>
			<div className="transcriptLiveArea" onClick={openModal}>
				{ segments && segments.map((segment,index) => {
					if (segment.startTime <= currentTime && segment.endTime > currentTime) {
						if (segment.lines) {
							return segment.lines.map((line,lineIndex) => {
								var lineIsActive = line.startTime <= currentTime && line.endTime > currentTime;
								if (lineIsActive) {
									return (
										<div key={'liveline' + lineIndex} className="liveSegment" style={{ backgroundColor: (speakers ? speakers[segment.speaker].color : '#EEEEEE' )}}>
											<div>
												{ (speakers && speakers[segment.speaker].avatar) &&
													<div className="avatar" style={{ backgroundColor: speakers[segment.speaker].color }}>
														<img src={speakers[segment.speaker].avatar} className="avatarImage"  />
													</div>
												}
												{ (speakers && !speakers[segment.speaker].avatar) &&
													<div className="avatar" style={{ backgroundColor: speakers[segment.speaker].color }}>
														{speakers[segment.speaker].initials}
													</div>
												}
											</div>
											{line.body}
										</div>
									);
								}
							});
						}
					}
				} ) }
			</div>
			<IonModal ref={modal} trigger='open-transcript-modal' presentingElement={presentingElement} canDismiss={true}>
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="start">
							<IonToggle checked={autoScroll} onIonChange={(onSearch) => { setAutoScroll(event.detail.checked); }} />
							<IonLabel>&nbsp;<span className="autoLabel">Auto</span> Scroll</IonLabel>
						</IonButtons>
						<IonTitle>Transcript</IonTitle>
						<IonButtons slot="end">
							<IonButton onClick={closeModal}>Close</IonButton>
						</IonButtons>
					</IonToolbar>
					<IonToolbar>
						<IonSearchbar onIonChange={onSearch} ref={searchBar} placeholder="Search Transcript" />
					</IonToolbar>
				</IonHeader>
				<IonContent className="smoothScroll" ref={contentNodeRef}>
					<div className="transcript">
						{ segments && segments.map((segment,index) => {
							var segmentIsActive = segment.startTime <= currentTime && segment.endTime > currentTime;
							
							if (segment.title) {
								return (
									<ChapterSegment
										key={'segment' + index}
										segment={segment}
									/>
								);
							}
							else {
								var returnSegment = (
									<TranscriptSegment
										key={'segment' + index}
										avatar={speakers ? speakers[segment.speaker].avatar : false}
										initials={speakers ? speakers[segment.speaker].initials : false}
										color={speakers ? speakers[segment.speaker].color : false}
										speakerName={speakers ? speakers[segment.speaker].name : false}
										position={speakers ? speakers[segment.speaker].position : false}
										currentTime={currentTime}
										startTime={segment.startTime}
										endTime={segment.endTime}
										isActive={segmentIsActive}
										lines={segment.lines}
										setCurrentTime={setCurrentTime}
										scrollToElement={scrollToElement}
										searchQuery={searchQuery}
									/>
								);
							}

							/*
							var returnSegment = (
								<>
								{ lastSpeaker !== segment.speaker &&
									<div>{segment.startTime}</div>
								}
								<div className={'segment ' + (isActive ? 'active ' : '') + (lastSpeaker !== segment.speaker ? " newSpeaker" : "sameSpeaker")} key={'segment' + index} onClick={() => { setCurrentTime(segment.startTime); }}>
									{ lastSpeaker !== segment.speaker &&
										<div className="speaker" style={{ backgroundColor: speakerColor }}>{segment.speaker}: </div>
									}
									{ lastSpeaker === segment.speaker &&
										<div className="emptySpeaker">&nbsp;</div>
									}
									<div className="body">{segment.body}</div>
								</div>
								</>
							);
							*/
							

							lastSpeaker = segment.speaker;

							return returnSegment;
						} ) }
					</div>
				</IonContent>
				<IonFooter>
					<IonToolbar>
						<IonButtons slot="primary">
							{ shouldPlay &&
								<IonButton onClick={audioPause}>
									<IonIcon icon={pauseIcon} />
									Pause audio
								</IonButton>
							}
							{ !shouldPlay &&
								<IonButton onClick={audioPlay}>
									<IonIcon icon={playIcon} />
									Play audio
								</IonButton>
							}
						</IonButtons>
					</IonToolbar>
				</IonFooter>
			</IonModal>
		</>
	);
}

function transcriptListShouldCache(prevList,nextList) {
	if (Math.round(nextList.currentTime) != Math.round(prevList.currentTime)) { return false; }
	if (JSON.stringify(prevList.podcast?.rssFeedContents?.persons) != JSON.stringify(nextList.podcast?.rssFeedContents?.persons)) { return false; }
	
	return true;
}

export default memo(TranscriptLiveArea, transcriptListShouldCache);


// export default TranscriptLiveArea;