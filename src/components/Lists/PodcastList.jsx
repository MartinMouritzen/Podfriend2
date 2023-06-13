import { IonSlides, IonSlide, IonLabel, IonRouterLink, IonSkeletonText } from '@ionic/react';
import PodcastImage from 'components/PodcastImage/PodcastImage';

import { Link } from 'react-router-dom';
// import CoverCarousel from './CoverCarousel';

const PodcastList = ({ podcasts, listType = 'scroll', filterString = '', backButtonText = false, displayLoadingCovers = 10 }) => {
	/*
	if (listType === 'scroll') {
		return (
			<CoverCarousel
				type="podcasts"
				podcasts={podcasts}
				backButtonText={backButtonText}
			/>
		);
	}
	*/

	return (
		<div className={'podcastGrid ' + listType}>
			{ (podcasts === false && displayLoadingCovers !== false) &&  Array.apply(null, { length: displayLoadingCovers }).map((e,i) => {
				return (
					<IonSkeletonText key={'loadingCover' + i} style={{ width: 200, height: 200 }} animated={true} />
				);
			} ) }
			{ podcasts !== false && podcasts.map((podcast) => {
				if (!podcast.name) {
					return;
				}
				if (filterString) {
					if (!podcast.name.toLowerCase().includes(filterString.toLowerCase())) {
						return;
					}
				}
				var imageWidth = 400;
				var coverWidth = 170;

				if (listType === 'list') {
					imageWidth = 120;
					coverWidth = 120;
				}

				return (
					<Link
						to={{
							pathname: '/podcast/' + podcast.path + '/',
							state: {
								podcast: podcast,
								backButtonText: backButtonText ? backButtonText : false
							}
						}}
						className='podcastItemLink'
						key={podcast.guid}
					>
						<div className="podcastItem">
							<PodcastImage
								podcastPath={podcast.path}
								imageErrorText={podcast.name}
								src={podcast.artworkUrl600 ? podcast.artworkUrl600 : podcast.image}
								className='cover'
								width={imageWidth}
								height={imageWidth}
								coverWidth={coverWidth}
								coverHeight={coverWidth}
								loadingComponent={() => <IonSkeletonText animated={true} className="coverLoading" />}
							/>
							<div className='podcastInfo'>
								<div className='title'>
									{podcast.name}
								</div>
								<div className='author'>
									{podcast.author}
								</div>
							</div>
						</div>
					</Link>
				);
			})}
		</div>
	);
};
export default PodcastList;