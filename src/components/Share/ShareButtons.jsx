import React, { useState } from 'react';

import ShareF from 'images/social/share-f.jpg';
import ShareT from 'images/social/share-t.jpg';

// import { Snackbar } from '@material-ui/core/';
// import { Alert } from  '@material-ui/lab/';

import './ShareButtons.scss';

const ShareButtons = ({ podcastTitle, podcastPath, episodeTitle, episodeDescription = false, episodeId, timeStamp = false, shareUrl = false}) => {
	const [showCopySuccessMessage,setShowCopySuccessMessage] = useState(false);

	const shareTitle = 'Check out this episode: ' + episodeTitle + ', from the podcast ' + podcastTitle;
	const shareTitleEncoded = encodeURI(shareTitle).replace('#','%23','g');

	const shareURL = shareUrl ? shareUrl : 'https://www.podfriend.com/podcast/' + podcastPath + '/' + episodeId;
	const shareURLEncoded = encodeURI(shareUrl);

	const copyToClipBoard = (event) => {
		event.stopPropagation();

		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareURL)
		}
		else {
			var dummy = document.createElement("textarea");
			document.body.appendChild(dummy);
			dummy.value = shareURL;
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
		}
		setShowCopySuccessMessage(true);
	};

	const navigatorShare = () => {
		navigator.share({
			title: shareTitle,
			text: shareTitle,
			url: shareURL
		});
	};
	
	const onHideCopySuccessMessage = () => {
		setShowCopySuccessMessage(false);
	};

	return (
		<div className='shareButtons'>
			<a href={'https://twitter.com/intent/tweet?text=' + shareTitleEncoded + '&url=' + shareURLEncoded} target="_blank" className='shareButton' onClick={(event) => { event.stopPropagation(); }}>
			<img src={ShareT} width="200" height="60" alt="Share on Twitter" /></a>
			&nbsp;
			{ navigator.share && typeof window.process !== 'object' &&
				<>
					<div className='clipBoardButton' onClick={(event) => { event.stopPropagation(); event.preventDefault(); navigatorShare(); }}>
						Share
					</div>
					&nbsp;
				</>
			}
			<div className='clipBoardButton' onClick={copyToClipBoard}>
				Copy link
			</div>
		</div>
	);
	/*
			<a href={'https://www.facebook.com/sharer/sharer.php?u=' + shareURLEncoded + '&p[title]=' + shareTitleEncoded + '&display=popup'} target="_blank" onClick={(event) => { event.stopPropagation(); }} className='shareButton'>
				<img src={ShareF} width="100" height="30" alt="Share on Facebook" /></a>
			&nbsp;
	*/
}
export default ShareButtons;