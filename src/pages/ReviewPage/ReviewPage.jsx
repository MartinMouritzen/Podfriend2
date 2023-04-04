import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import useStore from 'store/Store';

import { formatDistance } from 'date-fns';

import DOMPurify from 'dompurify';

import { ReviewStars } from "components/Reviews/StarRating";
import WriteReviewForm from './WriteReviewForm.jsx';

import {
	createOutline as editIcon2,
	starOutline as editIcon
} from 'ionicons/icons';

import Avatar from 'components/UI/Avatar/Avatar.jsx';

import './ReviewPage.scss';

import SVG from 'react-inlinesvg';
import Page from 'components/Page/Page';
import { IonButton, IonHeader, IonIcon, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';

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
	if (totalScore === null || isNaN(totalScore) || totalScore === false) {
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
				<IonButton expand='block' onClick={onWriteReviewClick} style={{ width: '100%', maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto' }}>
					<IonIcon icon={editIcon} slot="start" />
					{ false && existingReview !== false && existingReview.reviewContent &&
						<>Modify your review</>
					}
					{ false && existingReview !== false && !existingReview.reviewContent &&
						<>Modify your rating</>
					}
					{ true &&
						<>Rate this Podcast</>
					}
				</IonButton>
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
				{Math.round(percentage)}%
			</div>
		</div>
	);
}
const Review = ({ guid, reviewContent, reviewerName, reviewDate, userGuid, rating }) => {
	if (!reviewContent) {
		return null;
	}

	var reviewContent = nl2br(DOMPurify.sanitize(reviewContent,{
		ALLOWED_TAGS: ['i','em','b','strong']
	}));
	
	return (
		<div key={guid} className='review'>
			<div className='avatarColumn'>
				<div className='avatar'>
					<Avatar userName={reviewerName} userGuid={userGuid} />
				</div>
			</div>
			<div className='reviewColumn'>
				<div className='rating'>
					<ReviewStars secondaryColor='#cecece' rating={rating} size={24} />
				</div>
				<div className='reviewerName'>
					{reviewerName}
				</div>
				<div className='reviewContent' dangerouslySetInnerHTML={{__html:reviewContent}} />
				<div className='reviewDate'>
					<span className='agoText'>{formatDistance(reviewDate,new Date())} ago</span>
				</div>
			</div>
		</div>
	);
}
const ReviewPage = ({ match, onSubmitReview }) => {
	const podcastPath = match.params.podcastPath;
	const [podcast,setPodcast] = useState();

	const getPodcastFromCache = useStore((state) => state.getPodcastFromCache);
	const retrievePodcastFromServer = useStore((state) => state.retrievePodcastFromServer);
	const shouldPodcastUpdate = useStore((state) => state.shouldPodcastUpdate);

	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	const loggedIn = useStore((state) => state.loggedIn);
	const userData = useStore((state) => state.userData);

	const loadReviews = useStore((state) => state.loadReviews);

	const [reviews,setReviews] = useState([]);
	const [totalCountReviews,setTotalCountReviews] = useState(false);
	const [totalScore,setTotalScore] = useState(false);
	const [reviewsLoading,setReviewsLoading] = useState(true);

	
	const [hasReviewsWithText,setHasReviewsWithText] = useState([]);
	

	const [writingReview,setWritingReview] = useState(false);
	const [hasRated,setHasRated] = useState(false);
	const [reviewsNeedRefresh,setReviewsNeedRefresh] = useState(0);

	const [notLoggedInMessage,setNotLoggedInMessage] = useState(false);

	const location = useLocation();

	const refreshReviews = () => {
		loadReviews(podcast.guid)
		.then((reviewData) => {
			setReviewsLoading(false);
			setReviews(reviewData.reviews);
			setTotalCountReviews(reviewData.totalCountReviews);
			setTotalScore(reviewData.totalScore);
		})
		.catch((exception) => {
			console.log('Failed to load reviews');
			console.log(exception);
		});
	};

	useEffect(() => {
		console.log('review page path changed');
		if (podcast && podcast.guid) {
			setReviewsLoading(true);
			setReviews([]);
			setTotalCountReviews(false);
			setTotalScore(false);
			setWritingReview(false);

			refreshReviews();
		}

	},[podcast?.path]);

	useEffect(() => {
		setPodcast(false);
		if (location.state && location.state.podcast && location.state.episode) {
			setPodcast(location.state.podcast);
		}
		else {
			try {
				if (activePodcast.path === podcastPath) {
					setPodcast(activePodcast);
				}
				getPodcastFromCache(podcastPath)
				.then((podcastCache) => {
					if (podcastCache) {
						setPodcast(podcastCache);
					}
					var shouldUpdate = shouldPodcastUpdate(podcastCache);
			
					if (shouldUpdate) {
						retrievePodcastFromServer(podcastPath,podcastCache)
						.then((podcastDataFromServer) => {
							setPodcast(podcastDataFromServer);
						})
						.catch((error) => {
							console.log('Error2 fetching podcast in EpisodePage::fetchPodcast: ' + error);
							console.log(error);
							
							throw error;
						});
					}
				})
				.catch((exception) => {
					console.log('Error in episodePage:getPodcast (2)');
					console.log(exception);
				});
			}
			catch (exception) {
				console.log('Error in episodePage:getPodcast');
				console.log(exception);
			}
		}
	},[podcastPath]);

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
		setWritingReview(false);
		refreshReviews();
	};

	useEffect(() => {
		var hasText = false;
		console.log(reviews);
		for (var i=0;i<reviews.length;i++) {
			if (reviews[i].reviewContent) {
				hasText = true;
				break;
			}
		}
		setHasReviewsWithText(hasText);
	},[JSON.stringify(reviews)]);


	return (
		<Page className="reviewPage greyPage" defaultHeader={false} defaultHref={'/podcast/' + podcastPath} title={podcast ? `Reviews for ${podcast.name}` : 'Reviews'}>
			{ writingReview !== false &&
				<>
					<WriteReviewForm podcastName={podcast?.name} podcastGuid={podcast.guid} onSubmitReview={onSubmitReviewIntercept} />
				</>
			}
			{ writingReview === false &&
				<div className='reviewColumns heightWithoutPagePadding'>
					<ReviewAggregatedInfo totalCountReviews={totalCountReviews} reviews={reviews} totalScore={totalScore} onWriteReviewClick={onWriteReviewClick} notLoggedInMessage={notLoggedInMessage} />
					<div className='reviewList'>
						{ reviewsLoading &&
							<div className="reviewsLoading">
								<IonSpinner />
								Loading reviews for {podcast?.name}
							</div>
						}
						{ (!reviewsLoading && hasReviewsWithText !== true) &&
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
						{ (!reviewsLoading && hasReviewsWithText && reviews) && reviews.map((review) => {
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
		</Page>
	);
}
export default ReviewPage;