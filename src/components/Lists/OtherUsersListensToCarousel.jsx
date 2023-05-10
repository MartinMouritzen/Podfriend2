import { useState, useEffect } from 'react';

import useStore from 'store/Store';
import PodcastList from './PodcastList';

const OtherUsersListenToCarousel = ({ backButtonText = false }) => {
	const refreshOtherUsersListenToPodcasts = useStore((state) => state.refreshOtherUsersListenToPodcasts);
	const [otherUsersListenToList,setOtherUsersListenToList] = useState(false);

	useEffect(() => {
		refreshOtherUsersListenToPodcasts()
		.then(setOtherUsersListenToList);
	},[]);

	return (
		<div>
			<PodcastList backButtonText={backButtonText} podcasts={otherUsersListenToList} />
		</div>
	);
};
export default OtherUsersListenToCarousel;