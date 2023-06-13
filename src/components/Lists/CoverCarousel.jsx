import { useEffect } from 'react';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Navigation, Pagination } from "swiper";

import TimeUtil from 'library/TimeUtil';

import { IonSkeletonText } from '@ionic/react';

import PodcastImage from 'components/PodcastImage/PodcastImage';
import { Link } from 'react-router-dom';

const CoverCarousel = ({ type, podcasts, backButtonText }) => {
	useEffect(() => {
		console.log('podcasts changed');
		console.log(podcasts);
	},[podcasts]);

	return (
		<Swiper
			slidesPerView='auto'
			cssMode={true}
			slidesPerGroup={1}
			slidesPerGroupAuto={true}
			spaceBetween={10}
			slidesOffsetBefore={10}
			slidesOffsetAfter={10}
			touchMoveStopPropagation={true}
			touchStartForcePreventDefault={true}

			/* navigation={('ontouchstart' in window ? false : true)} */
			navigation={{
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			}}
			
			modules={[Navigation]}
			className="coverSwiper"
		>
			{ podcasts !== false && podcasts !== null && podcasts.map((podcast) => {
				return (

						<SwiperSlide key={podcast.path}>
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
									src={podcast.artworkUrl100 ? podcast.artworkUrl100 : podcast.image}
									className='cover'
									width={400}
									height={400}
									coverWidth={120}
									coverHeight={120}
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
						</SwiperSlide>
					
				);
			})}
			<div className="swiper-button-prev"></div>
			<div className="swiper-button-next"></div>
		</Swiper>
	);
}
export default CoverCarousel;