import React, { useState, useEffect } from 'react';

import useStore from 'store/Store';

import { distanceInWordsToNow } from 'date-fns';

import DOMPurify from 'dompurify';

import { ReviewStars } from "components/Reviews/StarRating";
import WriteReviewForm from './WriteReviewForm.jsx';

import {
	createOutline as editIcon
} from 'ionicons/icons';

import Avatar from 'components/UI/Avatar/Avatar.jsx';

import styles from './ReviewPage.scss';

import SVG from 'react-inlinesvg';
import Page from 'components/Page/Page';
import { IonIcon } from '@ionic/react';

// import SadPodfriend from 'podfriend-approot/images/design/flow-illustrations/podfriend-sad.svg';
const SadPodfriend = () => <SVG src={require('images/flow-illustrations/podfriend-sad.svg')} />;

function nl2br (str, is_xhtml) {
    if (typeof str === 'undefined' || str === null) {
        return '';
    }
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

const ReviewAggregatedInfo = ({ totalCountReviews, reviews, totalScore, onWriteReviewClick, existingReview, notLoggedInMessage }) => {
	const loggedIn = useStore((state) => state.loggedIn);

	var ratings = {
		1: 0,
		2: 0,
		3: 0,
		4: 0,
		5: 0
	};

	if (Array.isArray(reviews)) {
		for(var i=0;i<reviews.length;i++) {
			ratings[reviews[i].rating]++;
		}
	}
	if (totalScore === null || isNaN(totalScore)) {
		totalScore = 0;
	}

	return (
		<div className='reviewAggregatedColumn'>
			<div className='reviewAggregatedInfo'>
				<div style={{ display: 'flex'}}>
					<div className='totalScore'>{ parseFloat(totalScore).toFixed(1)}</div>
					<div>
						<ReviewStars secondaryColor='#cecece' rating={totalScore} size={30} />
						<div className='basedOn'>based on {totalCountReviews} review{totalCountReviews != 1 ? 's' : ''}</div>
					</div>
				</div>
				<div className='ratingBreakdownLines'>
					<RatingBreakDownLine rating={5} numberOfRatings={ratings[5]} totalRatings={totalCountReviews} />
					<RatingBreakDownLine rating={4} numberOfRatings={ratings[4]} totalRatings={totalCountReviews} />
					<RatingBreakDownLine rating={3} numberOfRatings={ratings[3]} totalRatings={totalCountReviews} />
					<RatingBreakDownLine rating={2} numberOfRatings={ratings[2]} totalRatings={totalCountReviews} />
					<RatingBreakDownLine rating={1} numberOfRatings={ratings[1]} totalRatings={totalCountReviews} />
				</div>
			</div>
			{ notLoggedInMessage === false &&
				<button className='writeAReview' onClick={onWriteReviewClick}>
					<IonIcon icon={editIcon} />
					{ false && existingReview !== false && existingReview.reviewContent &&
						<>Modify your review</>
					}
					{ false && existingReview !== false && !existingReview.reviewContent &&
						<>Modify your rating</>
					}
					{ true &&
						<>Rate this Podcast</>
					}
				</button>
			}
			{ notLoggedInMessage !== false &&
				<div className='notLoggedInMessage warningMessage' style={{ marginTop: 20 }}>
					Hey friend! You need a profile to be able to rate and review Podcasts.<br /><br />
					You can create a profile or log in by clicking on the user icon in the top right corner.
				</div>
			}
		</div>
	);
}
const RatingBreakDownLine = ({ rating, numberOfRatings, totalRatings }) => {
	var percentage = numberOfRatings === 0 ? 0 : numberOfRatings / totalRatings * 100;
	return (
		<div className='ratingBreakdowLineContainer' key={rating}>
			<div className='ratingBreakdowLineLabel'>
				{rating} stars
			</div>
			<div key={rating} className='ratingBreakdownLine'>
				<div className='ratingBreakdownLine' title={`${numberOfRatings} reviews. ${percentage}% of all reviews.`}>
					<div className='ratingBreakdownLineInner' rating={rating} style={{ width: percentage + '%' }}>

					</div>
				</div>
			</div>
			<div className='ratingPercentage'>
				{percentage}%
			</div>
		</div>
	);
}
class Review extends React.PureComponent {
	render() {
		if (!this.props.reviewContent) {
			return null;
		}

		var reviewContent = nl2br(DOMPurify.sanitize(this.props.reviewContent,{
			ALLOWED_TAGS: ['i','em','b','strong']
		}));
		
		return (
			<div key={this.props.guid} className='review'>
				<div className='avatarColumn'>
					<div className='avatar'>
						<Avatar userName={this.props.reviewerName} userGuid={this.props.userGuid} />
					</div>
				</div>
				<div className='reviewColumn'>
					<div className='rating'>
						<ReviewStars secondaryColor='#cecece' rating={this.props.rating} size={24} />
					</div>
					<div className='reviewerName'>
						{this.props.reviewerName}
					</div>
					<div className='reviewContent' dangerouslySetInnerHTML={{__html:reviewContent}} />
					<div className='reviewDate'>
						<span className='agoText'>{distanceInWordsToNow(this.props.reviewDate)} ago</span>
					</div>
				</div>
			</div>
		);
	}
}
const ReviewPage = ({ podcastName, totalCountReviews, totalScore, podcastGuid, onSubmitReview }) => {
	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);

	const loadReviews = useStore((state) => state.loadReviews);

	const [reviews,setReviews] = useState([]);

	const [writingReview,setWritingReview] = useState(false);
	const [hasRated,setHasRated] = useState(false);
	const [reviewsNeedRefresh,setReviewsNeedRefresh] = useState(0);

	const [notLoggedInMessage,setNotLoggedInMessage] = useState(false);

	const onWriteReviewClick = () => {
		if (loggedIn) {
			setWritingReview(true);
		}
		else {
			setNotLoggedInMessage(true);
		}
	};

	const onSubmitReviewIntercept = () => {
		setReviewsNeedRefresh(reviewsNeedRefresh + 1);
		onSubmitReview();
	};

	var hasReviewsWithText = false;
	for (var i=0;i<reviews.length;i++) {
		if (reviews[i].reviewContent) {
			hasReviewsWithText = true;
			break;
		}
	}

	return (
		<Page>
			<div className='reviewPane'>
				{ writingReview !== false &&
					<WriteReviewForm podcastName={podcastName} podcastGuid={podcastGuid} onSubmitReview={onSubmitReviewIntercept} />
				}
				{ writingReview === false &&
					<div className='reviewColumns'>
						<ReviewAggregatedInfo totalCountReviews={totalCountReviews} reviews={reviews} totalScore={totalScore} onWriteReviewClick={onWriteReviewClick} notLoggedInMessage={notLoggedInMessage} />
						<div className='reviewList'>
							{ hasReviewsWithText !== true &&
								<div className='noReviews'>
									<div className='noReviewsIllustration'>
										<SadPodfriend />
									</div>
									<div className='noReviewsText'>
										No reviews yet.
									</div>
									<div className='noReviewsSubText'>
										{ loggedIn === true &&
											<>
												Make Podfriend happy! Be the first to write a review.
											</>
										}
										{ loggedIn === false &&
											<>
												Make Podfriend happy! Log in, and be the first to write a review.
											</>
										}
									</div>
								</div>
							}
							{ hasReviewsWithText && reviews && reviews.map((review) => {
								return (
									<Review
										hasRated={hasRated}
										guid={review.guid}
										userGuid={review.userGuid}
										rating={review.rating}
										reviewerName={review.reviewerName}
										reviewDate={review.reviewDate}
										reviewContent={review.reviewContent}
									
									/>
								);
							}) }
						</div>
					</div>
				}
			</div>
		</Page>
	);
}
export default ReviewPage;