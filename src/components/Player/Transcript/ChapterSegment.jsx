const ChapterSegment = ({ segment } ) => {
	console.log(segment);
	return (
		<div className="transcriptChapter">
			<div className="transcriptChapterInner">
				<div className="chapterImage">
					<img src={segment.img} />
				</div>
				<div className="chapterTitle">
					<div>
						{segment.title}
					</div>
					<div className="chapterLabel">
						Chapter
					</div>
				</div>
			</div>
		</div>
	);
};
export default ChapterSegment;