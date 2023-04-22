import { IonSpinner } from '@ionic/react';
import PodcastList from 'components/Lists/PodcastList';
import { useEffect, useState } from 'react';

import useStore from 'store/Store';

const PodRoll = ({ podRoll }) => {
	const retrievePodcastByGuid = useStore((state) => state.retrievePodcastByGuid);
	const [podcasts,setPodcasts] = useState(false);

	useEffect(() => {
		setPodcasts(false);

		if (podRoll) {
			retrievePodcastByGuid(podRoll)
			.then((podcasts) => {
				console.log(podcasts);
				setPodcasts(podcasts);
			})
			.catch((exception) => {
				console.log('Error in PodRoll');
				console.log(exception);
			});
		}
	},[podRoll]);

	return (
		<div className="podRolls">
			{ podcasts !== false &&
				<div>
					<PodcastList podcasts={podcasts} />
				</div>
			}
			{ podcasts === false &&
				<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
					<IonSpinner />
					<span style={{ marginLeft: 10, color: 'rgba(0,0,0,0.7)' }}>Loading recommendations</span>
				</div>
			}
		</div>
	);
}
export default PodRoll;