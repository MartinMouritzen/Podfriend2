import React from 'react';

import './StarRating.scss';

import { IonIcon } from '@ionic/react';

import {
	star,
	starOutline,
} from 'ionicons/icons';

const ReviewStar = ({ full, size, rating, primaryColor, secondaryColor, onClick = false }) => {
	return (
		<div
			key={'StarRating' + rating}
			className={(full ? 'starFilled' : 'starNormal')}
			style={{ fontSize: size ? size : false }}
			onClick={() => { if (onClick) { onClick(rating); } }}
		>
				<IonIcon icon={(full ? star : starOutline)} color={primaryColor} />
		</div>
	);
};

const ReviewStars = ({ rating, size, primaryColor = '#ffcc48', secondaryColor = '#75757e', onClick = false }) => {
	const renderStars = () => {
		var stars = [];
		for(var i=1;i<=5;i++) {
			stars.push(<ReviewStar key={'star' + i} full={(Math.round(rating) >= i)} rating={i} size={size} onClick={onClick} primaryColor={primaryColor} secondaryColor={secondaryColor} />);
		}
		return stars;
	}
	return (
		<div className='stars'>
			{ renderStars() }
		</div>
	);
}
/**
*
*/
const ReviewStarsWithText = ({ rating, reviews, primaryColor, secondaryColor, style, onClick, size}) => {
	return (
		<div className={'starRating'} style={style} onClick={onClick}>
			<ReviewStars
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
				rating={rating}
				size={size}
			/>
			<div className='reviewBasedOn'>
				{ reviews > 0 && 
					<>
					{reviews} reviews
					</>
				}
				{ !reviews &&
					<>
					No reviews yet
					</>
				}
			</div>
		</div>
	);
}
export {
	ReviewStars,
	ReviewStarsWithText
}