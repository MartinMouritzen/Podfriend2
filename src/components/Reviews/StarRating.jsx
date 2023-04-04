import React from 'react';

import './StarRating.scss';

import { IonIcon } from '@ionic/react';

import {
	star,
	starOutline,
} from 'ionicons/icons';

const StarOutline = ({ width, height }) => {
	return (
		<svg style={{ width: width, height: height }}  enableBackground="new 0 0 32 32" id="Layer_1" version="1.1" viewBox="0 0 32 32" width="32px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M31.881,12.557c-0.277-0.799-0.988-1.384-1.844-1.511l-8.326-1.238l-3.619-7.514  C17.711,1.505,16.896,1,16,1c-0.896,0-1.711,0.505-2.092,1.294l-3.619,7.514l-8.327,1.238c-0.855,0.127-1.566,0.712-1.842,1.511  c-0.275,0.801-0.067,1.683,0.537,2.285l6.102,6.092l-1.415,8.451C5.2,30.236,5.569,31.09,6.292,31.588  C6.689,31.861,7.156,32,7.623,32c0.384,0,0.769-0.094,1.118-0.281L16,27.811l7.26,3.908C23.609,31.906,23.994,32,24.377,32  c0.467,0,0.934-0.139,1.332-0.412c0.723-0.498,1.09-1.352,0.947-2.203l-1.416-8.451l6.104-6.092  C31.947,14.239,32.154,13.357,31.881,12.557z M23.588,19.363c-0.512,0.51-0.744,1.229-0.627,1.934l1.416,8.451l-7.26-3.906  c-0.348-0.188-0.732-0.281-1.118-0.281c-0.384,0-0.769,0.094-1.117,0.281l-7.26,3.906l1.416-8.451  c0.118-0.705-0.114-1.424-0.626-1.934l-6.102-6.092l8.326-1.24c0.761-0.113,1.416-0.589,1.743-1.268L16,3.251l3.62,7.513  c0.328,0.679,0.982,1.154,1.742,1.268l8.328,1.24L23.588,19.363z" id="star"/></svg>
	);
}
const Star = ({ width, height }) => {
	return (
		<svg style={{ width: width, height: height }} enableBackground="new 0 0 32 32" id="Glyph" version="1.1" viewBox="0 0 32 32" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path d="M29.895,12.52c-0.235-0.704-0.829-1.209-1.549-1.319l-7.309-1.095l-3.29-6.984C17.42,2.43,16.751,2,16,2  s-1.42,0.43-1.747,1.122l-3.242,6.959l-7.357,1.12c-0.72,0.11-1.313,0.615-1.549,1.319c-0.241,0.723-0.063,1.507,0.465,2.046  l5.321,5.446l-1.257,7.676c-0.125,0.767,0.185,1.518,0.811,1.959c0.602,0.427,1.376,0.469,2.02,0.114l6.489-3.624l6.581,3.624  c0.646,0.355,1.418,0.311,2.02-0.114c0.626-0.441,0.937-1.192,0.811-1.959l-1.259-7.686l5.323-5.436  C29.958,14.027,30.136,13.243,29.895,12.52z" id="XMLID_328_"/></svg>
	);
}
const ReviewStar = ({ full, size, rating, primaryColor, secondaryColor, onClick = false }) => {
	return (
		<div
			key={'StarRating' + rating}
			className={(full ? 'starFilled' : 'starNormal')}
			style={{ fontSize: size ? size : false }}
			onClick={() => { if (onClick) { onClick(rating); } }}
		>
			{ full !== false &&
				<Star width={size} height={size} />
			}
			{ full === false &&
				<Star style={{ width: size, height: size }} />
			}
		</div>
	);
	// <IonIcon icon={(full ? star : star)} color={primaryColor} />
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
const ReviewStarsWithText = ({ rating = false, reviews, primaryColor, secondaryColor, style, onClick, size}) => {
	return (
		<div className={'starRating'} style={style} onClick={onClick}>
			<ReviewStars
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
				rating={rating}
				size={size}
			/>
			{ rating &&
				<div className="rating">{parseFloat(rating).toFixed(1)} out of 5</div>
			}
			<div className='reviewBasedOn'>
				
				{ reviews > 0 && 
					<>
						based on {reviews} review{(reviews == 1 ? '' : 's')}
					</>
				}
				{ (!reviews || reviews == 0) &&
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