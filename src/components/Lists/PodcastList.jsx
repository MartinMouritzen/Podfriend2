import { IonSlides, IonSlide, IonLabel, IonRouterLink } from '@ionic/react';
import PodcastImage from 'components/PodcastImage/PodcastImage';

const PodcastList = ({ podcasts, listType = 'scroll', filterString = '' }) => {
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

	return (
		<div className={'podcastGrid ' + listType}>
			{ podcasts !== false && podcasts.map((podcast) => {
				if (filterString) {
					if (!podcast.name.toLowerCase().includes(filterString.toLowerCase())) {
						return;
					}
				}
				var imageWidth = 400;
				var coverWidth = 180;

				if (listType === 'list') {
					imageWidth = 120;
					coverWidth = 120;
				}

				return (
					<IonRouterLink routerLink={'/podcast/' + podcast.path} routerDirection='forward' className='podcastItemLink' key={podcast.guid}>
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
							/>
							<div className='podcastInfo'>
								<IonLabel className='author'>
									{podcast.author}
								</IonLabel>
								<IonLabel className='title'>
									{podcast.name}
								</IonLabel>
								<IonLabel className='date'>
									{podcast.date}
								</IonLabel>
							</div>
						</div>
					</IonRouterLink>
				);
			})}
		</div>
	);
};
export default PodcastList;