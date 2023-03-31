import { IonSlides, IonSlide, IonLabel, IonRouterLink, IonSkeletonText } from '@ionic/react';
import PodcastImage from 'components/PodcastImage/PodcastImage';

import { Link } from 'react-router-dom';
import CoverCarousel from './CoverCarousel';

const PodcastList = ({ podcasts, listType = 'scroll', filterString = '', backButtonText = false }) => {
	const onClick = () => {
		console.log('yay');
	};

	const slideOpts = {
		slidesPerView: 'auto',
		zoom: false,
		grabCursor: true,
		spaceBetween: 20,
		slidesOffsetBefore: 20,
		ionSlideTap: onClick
	};

	if (listType === 'scroll') {
		return (
			<CoverCarousel
				type="podcasts"
				podcasts={podcasts}
				backButtonText={backButtonText}
			/>
		);
	}

	return (
		<div className={'podcastGrid ' + listType}>
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
							pathname: '/podcast/' + podcast.path,
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
								src={podcast.artworkUrl100 ? podcast.artworkUrl100 : podcast.image}
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