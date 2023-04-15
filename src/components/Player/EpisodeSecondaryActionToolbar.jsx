import { IonButton, IonIcon, IonSkeletonText } from '@ionic/react';
import {
	chatboxOutline as chatIcon,
	bookOutline as chapterIcon
} from 'ionicons/icons';

import PodcastImage from 'components/PodcastImage/PodcastImage';

const EpisodeSecondaryActionToolbar = ({ activePodcast, activeEpisode, navigateToPodcast, openChatModal }) => {
	return (
		<div className="episodeSecondaryActionToolbar">
			{ /*
			<div className="episodeSecondaryActionButton" title="Chapters">
				<IonIcon slot="icon-only" icon={chapterIcon} />
			</div>
			<div className="episodeSecondaryActionButton" title="Chapters">
				<IonIcon slot="icon-only" icon={chapterIcon} />
			</div>
			*/ }
			<div className="episodeSecondaryActionButton" title="chat" onClick={openChatModal}>
				<IonIcon slot="icon-only" icon={chatIcon} />
			</div>
			<div className="episodeSecondaryActionButton" title="Go to podcast" onClick={navigateToPodcast}>
				<PodcastImage
					podcastPath={activePodcast.path}
					width={120}
					height={120}
					coverWidth={30}
					coverHeight={30}
					imageErrorText={activePodcast.name}
					fallBackImage={activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
					src={activePodcast.artworkUrl600 ? activePodcast.artworkUrl600 : activePodcast.image}
					className={'podcastThumbnail'}
					loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
				/>
			</div>
		</div>
	);
}
export default EpisodeSecondaryActionToolbar;