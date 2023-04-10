import TimeUtil from 'library/TimeUtil';

import { memo, useEffect, useRef } from 'react';

const TranscriptSegment = ({ avatar, initials, color, speakerName, position, currentTime, startTime, endTime, lines, isActive, setCurrentTime, scrollToElement, searchQuery }) => {
	const segmentRef = useRef(null)

	/*
	useEffect(() => {
		if (isActive && segmentRef && segmentRef.current) {
			scrollToElement(segmentRef.current);
		}
	},[isActive]);
	*/

	var searchQueryExists = false;

	if (searchQuery) {
		lines.forEach((line,index) => {
			if (line.body.toLowerCase().includes(searchQuery)) {
				searchQueryExists = true;
			}
		});
	}
	if (searchQuery && !searchQueryExists) {
		return null;
	}

	return (
		<div className={'segmentContainer ' + (isActive ? 'active ' : '') + 'position_' + position} ref={segmentRef}>
			{ position === 'left' &&
				<div className="avatar" style={{ backgroundColor: color ? color.backgroundColor : 'var(--primary-color)' }}>
					{ avatar &&
						<img src={avatar} className="avatarImage"  />
					}
					{ !avatar &&
						<>
							{initials}
						</>
					}
				</div>
			}
			<div className="segmentContainerInner">
				<div className="segmentGroupInfo">
					<div className="speaker">
						{speakerName}
					</div>
					<div className="time">
						{TimeUtil.fancyTimeFormat(startTime)}
					</div>
				</div>
				<div className="lines" style={{ backgroundColor: color ? color.backgroundColor : 'var(--primary-color-light)', color: color ? color.textColor : '#FFFFFF' }}>
					{ lines && lines.map((line,index) => {
						var lineIsActive = line.startTime <= currentTime && line.endTime > currentTime;
						// var body = line.body;
						var extraClass = '';
						if (searchQuery) {
							if (searchQueryExists && !line.body.toLowerCase().includes(searchQuery)) {
								// body = '...';
								extraClass = 'notRelevant';
							}
						}
						return (
							<div key={'line' + index} className={'line ' + extraClass + (lineIsActive ? ' active' : '')} onClick={() => { setCurrentTime(line.startTime); }} dangerouslySetInnerHTML={{__html:line.body}}>
								
							</div>
						);
					} ) }
				</div>
			</div>
			{ position === 'right' &&
				<div className="avatar" style={{ backgroundColor: color ? color.backgroundColor : 'var(--primary-color)' }}>
					{ avatar &&
						<img src={avatar} className="avatarImage"  />
					}
					{ !avatar &&
						<>
							{initials}
						</>
					}
				</div>
			}
		</div>
	);
};

function transcriptSegmentShouldCache(prevList,nextList) {
	if (nextList.isActive) { return false; }
	if (nextList.isActive !== prevList.isActive) { return false; }
	if (nextList.avatar !== prevList.avatar) { return false; }
	if (nextList.color !== prevList.color) { return false; }
	if (nextList.speakerName !== prevList.speakerName) { return false; }
	if (nextList.searchQuery !== prevList.searchQuery) { return false; }
	
	return true;
}

export default memo(TranscriptSegment, transcriptSegmentShouldCache);
// export default TranscriptSegment;