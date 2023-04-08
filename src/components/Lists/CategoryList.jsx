import './CategoryList.scss';

import { Link } from 'react-router-dom';

import categories from 'constants/categories';

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Navigation, Pagination } from "swiper";

const CategoryList = () => {
	return (
		<Swiper
			slidesPerView='auto'
			slidesPerGroup={1}
			slidesPerGroupAuto={true}
			spaceBetween={10}
			slidesOffsetBefore={10}
			slidesOffsetAfter={10}
			/* navigation={('ontouchstart' in window ? false : true)} */
			navigation={{
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			}}
			pagination={{
				clickable: true,
			}}
			modules={[Navigation, Pagination]}

			className="coverSwiper categoryList"
		>
			{ Object.entries(categories).map(([key,value]) => {
				const category = categories[key];
				return (
					<SwiperSlide key={category.id}>
						<Link
							to={{
								pathname: '/categories/' + category.key + '/'
							}}
							className='podcastItemLink'
							
						>
							<div className="category" key={category.name}>
								<div className="categoryPhoto" style={{ backgroundImage: 'url("' + category.image + '")' }}>

								</div>
								<div className="categoryName" style={{ backgroundColor: category.backgroundColor, color: category.color }}>
									{category.name}
								</div>
							</div>
						</Link>
					</SwiperSlide>
				);
			} ) }
		
		</Swiper>
	);
};
export default CategoryList;