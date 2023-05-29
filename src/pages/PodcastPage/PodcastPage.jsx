import { IonHeader, IonToolbar, IonTitle, IonSkeletonText, IonButton, IonIcon, useIonActionSheet, IonItem, IonChip, IonList } from "@ionic/react";
import Page from "components/Page/Page";
import PodcastImage from "components/PodcastImage/PodcastImage";
import { useState, useEffect, useRef } from "react";

import { useLocation } from "react-router";

import './PodcastPage.scss';

import { ReviewStarsWithText } from "components/Reviews/StarRating";

import useStore from 'store/Store';

import { Link } from 'react-router-dom';

import ReadMoreReact from 'read-more-react';

import LoadingRings from 'images/loading/loading-rings.svg';

import followIcon from 'images/icons/plus-circle.svg';
import playIcon from 'images/icons/play-circle.svg';
import dotsIcon from 'images/icons/dots.svg';
// import { autoUpdater } from "electron";

import useDimensions from "hooks/useDimensions";
import EpisodeList from "./EpisodeList";
import PodcastPersons from "./PodcastPersons";
import RSSFeed from "library/RSSFeed";

import {
	earthSharp as websiteIcon,
	micSharp as companyIcon,
	cashOutline as donateIcon,
} from 'ionicons/icons';
import LiveEpisodes from "./LiveEpisodes";
import PodRoll from "./PodRoll";
import EpisodeItem from "./EpisodeItem";

const PodcastPage = ({ match }) => {
	const [actionButtonsRef, { x, y, width: actionButtonsWidth }] = useDimensions();

	const activePodcast = useStore((state) => state.activePodcast);
	const activeEpisode = useStore((state) => state.activeEpisode);

	const getPodcastFromCache = useStore((state) => state.getPodcastFromCache);
	const shouldPodcastUpdate = useStore((state) => state.shouldPodcastUpdate);
	const retrievePodcastFromServer = useStore((state) => state.retrievePodcastFromServer);
	const retrieveOriginalPodcastFeed = useStore((state) => state.retrieveOriginalPodcastFeed);
	const followPodcast = useStore((state) => state.followPodcast);
	const unfollowPodcast = useStore((state) => state.unfollowPodcast);
	const isPodcastFollowed = useStore((state) => state.isPodcastFollowed);

	const playEpisode = useStore((state) => state.playEpisode);

	const podcastPath = match.params.podcastPath;

	const seasonType =  useStore((state) => state.podcasts[podcastPath] ? state.podcasts[podcastPath].seasonType : undefined);

	const [podcastRSSData,setPodcastRSSData] = useState(false);

	const [podcastIsFollowed,setPodcastIsFollowed] = useState(false);
	const [podcastState,setPodcastState] = useState('loading');
	const [error,setError] = useState(false);
	const [podcastData,setPodcastData] = useState(false);

	const [showReviews,setShowReviews] = useState(false);
	const [activeEpisodeIsShownInList,setActiveEpisodeIsShownInList] = useState(false);

	const [overruleOriginalRSSCache,setOverruleOriginalRSSCache] = useState(false);
	const [podcastLocation,setPodcastLocation] = useState(false);
	const [showPodcastLocation,setShowPodcastLocation] = useState(false);
	const [persons,setPersons] = useState(false);
	const [podRoll,setPodRoll] = useState(false);
	const [liveItems,setLiveItems] = useState(false);
	
	const location = useLocation();

	const [actionSheetPresent] = useIonActionSheet();

	const onFollowPodcast = () => {
		followPodcast(podcastData.path);
		setPodcastIsFollowed(true);
	};
	const onUnfollowPodcast = () => {
		unfollowPodcast(podcastData.path);
		setPodcastIsFollowed(false);
	};

	/*
	useEffect(() => {
		setPodcastRSSData(podcastData.rssFeedContents);
	},[podcastData.rssFeedContents?.uuid]);
	*/

	useEffect(() => {
		console.log('Original RSS Feed contents changed');
		console.log(podcastRSSData);

		if (!podcastRSSData) {
			console.log('No podcastRSData');
			setPersons(false);
			setPodRoll(false);
			setPodcastLocation(false);
			setLiveItems(false);
			return;
		}
		if (podcastRSSData.liveItems) {
			setLiveItems(podcastRSSData.liveItems);
		}
		if (podcastRSSData.location) {
			// console.log('Feed has location');
			// console.log(podcastRSSData.location);
			setPodcastLocation(podcastRSSData.location);
		}
		else {
			setPodcastLocation(false);
		}

		if (podcastRSSData.podRoll) {
			setPodRoll(podcastRSSData.podRoll);
		}
		else {
			setPodRoll(false);
		}

		if (podcastRSSData.persons) {
			// console.log('Feed has persons');
			// console.log(podcastRSSData.persons);
			setPersons(podcastRSSData.persons);
		}
		else {
			// console.log('Feed doesn\'t have persons');
			setPersons(false);
		}
	},[JSON.stringify(podcastRSSData)]);

	const refreshPodcast = () => {
		return retrievePodcastFromServer(podcastPath)
		.then((podcastDataFromServer) => {
			if (podcastDataFromServer !== false) {
				setPodcastData(podcastDataFromServer);
				setPodcastState('loaded');
			}
		})
		.catch((error) => {
			console.log('Error2 fetching podcast in PodcastPage::fetchPodcast: ' + error);
			console.log('We should not dispatch a redux error if this is an abort.');
			console.log(error);

			setPodcastState('error');
		});
	}
	const loadPodcast = async (podcastPath,ignoreCache = false) => {
		try {
			if (activePodcast.path === podcastPath) {
				setPodcastData(activePodcast);
				setPodcastState('loaded');
			}
			else {
				setPodcastState('loading');
				setPodcastData(false);
			}
			getPodcastFromCache(podcastPath)
			.then((podcastCache) => {
				if (podcastCache) {
					console.log('we had a cache');
					setPodcastData(podcastCache);
					setPodcastState('loaded');
				}
				var shouldUpdate = shouldPodcastUpdate(podcastCache);
		
				if (shouldUpdate) {
					console.log('Podcast should update');
					retrievePodcastFromServer(podcastPath)
					.then((podcastDataFromServer) => {
						setPodcastData(podcastDataFromServer);
						setPodcastState('loaded');
					})
					.catch((error) => {
						console.log('Error2 fetching podcast in PodcastPage::fetchPodcast: ' + error);
						console.log('We should not dispatch a redux error if this is an abort.');
						console.log(error);
						
						setPodcastState('error');
					});
				}
			});
		}
		catch (exception) {
			setPodcastState('error');
			console.log('Error in getPodcast');
			console.log(exception);
		}
	};

	useEffect(() => {
		if (podcastState === 'loaded') {
			retrieveOriginalPodcastFeed(podcastData.path,podcastData.feedUrl,overruleOriginalRSSCache)
			.then((feed) => {
				setOverruleOriginalRSSCache(false);
				console.log('new original feed');
				console.log(feed);
				setPodcastRSSData(feed);
			});
		}
	},[podcastData?.receivedFromServerText]);

	const scrollableContentRef = useRef(null);
	const setScrollableContentRef = (ref) => {
		scrollableContentRef.current = ref;
	};

	useEffect(() => {
		// Scroll to the top when podcast changes. Otherwise we risk weird behaviour if the user scrolled on a previous podcast page
		if (scrollableContentRef) {
			setTimeout(() => {
				// console.log(scrollableContentRef);
				// console.log(scrollableContentRef.current);
				if (scrollableContentRef && scrollableContentRef.current) {
					scrollableContentRef.current.scrollToTop(0);
				}
			},50);
		}
		const intervalId = setInterval(() => {
			console.log('Doing 10 minute podcast refresh');
			doRefresh();
		},600000);

		setPodcastState('loading');
		setPodcastData(false);
		console.log('unsetting podcast RSS data');
		setPodcastRSSData(false);
		setError(false);
		loadPodcast(podcastPath);
		setPodcastIsFollowed(isPodcastFollowed(podcastPath));

		return () => {
			clearInterval(intervalId);
		};
	},[podcastPath]);

	/*
	const title = podcastState === 'loading' ? 'Loading...' : (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
			<PodcastImage
				alt={podcastData.name + ' cover art'}
				imageErrorText={podcastData.name}
				podcastPath={podcastData.path}
				width={120}
				height={120}
				coverWidth={30}
				coverHeight={30}
				src={podcastData.artworkUrl600}
				className='titleCover'
				draggable="false"
				loadingComponent={() => { return ( <div className='loadingCover'><img className='loadingIndicator' src={LoadingRings} /></div> ) }}
			/>
			<span style={{ marginLeft: 14 }}>
				{podcastData.name}
			</span>
		</div>
	);
	*/

	function doRefresh(event) {

		console.log('Begin podcast sync');
		/*	  
		setTimeout(() => {
		  console.log('Async operation has ended');
		  event.detail.complete();
		}, 2000);
		*/

		setOverruleOriginalRSSCache(true);

		var startTime = new Date();
		refreshPodcast()
		.then(() => {
			var endTime = new Date();
			var timeDifference = endTime - startTime;
			
			var minimumTimeToDisplayLoading = 1500;
			var remainingTime = 0;
			
			if (timeDifference < minimumTimeToDisplayLoading) {
				remainingTime = minimumTimeToDisplayLoading - timeDifference;
			}
			setTimeout(() => {
				if (event && event.detail && event.detail.complete) {
					event.detail.complete();
				}
			},remainingTime);
		});
	}

	const showReviewModal = () => {
		setShowReviews(true);
	};
	const hideReviewModal = () => {
		setShowReviews(false);
	};

	const startPlayingPodcast = () => {
		console.log('startPlayingPodcast');
		var guid = false;
		if (seasonType === 'episodic') {
			guid = podcastData.episodes[0].guid;
		}
		else {
			guid = podcastData.episodes[podcastData.episodes.length -1].guid;
		}
		if (guid) {
			playEpisode(podcastPath,podcastData,guid);
		}
	};

	return (
		<Page defaultHeader={false} title={podcastData ? podcastData.name : 'Loading...'} className="podcastPage greyPage" setScrollableContentRef={setScrollableContentRef} onRefresh={doRefresh}>
			<div className="podcastPageContent">
				<div className="podcastHeader">
					<div className="coverHolder">
						{ (podcastState === 'loading' || !podcastData) &&
							<IonSkeletonText animated={true} style={{ width: '90vw', height: '90vw', maxWidth: '400px', maxHeight: '400px' }} className="cover"></IonSkeletonText>
						}
						{ (podcastState === 'loaded' && podcastData) &&
							<PodcastImage
								alt={podcastData.name + ' cover art'}
								imageErrorText={podcastData.name}
								podcastPath={podcastPath}
								width={600}
								height={600}
								coverWidth={400}
								coverHeight={400}
								src={podcastData.artworkUrl600}
								className='cover'
								draggable="false"
								loadingComponent={() => {
									return (
										<IonSkeletonText animated={true} style={{ width: '90vw', height: '90vw', maxWidth: '400px', maxHeight: '400px' }} className="cover"></IonSkeletonText>
									)
								}}
							/>
						}
					</div>
					<div className="podcastHeaderContent">
						{ (false && podcastState === 'loading') &&
							<div className="author">
								<IonSkeletonText animated={true} style={{ width: 250, height: 20 }}></IonSkeletonText>
							</div>
						}
						{ (false && podcastState === 'loaded') &&
							<div className="author">
								{podcastData?.author}
							</div>
						}
						<IonHeader collapse="condense">
							<IonToolbar>
								<IonTitle size="large">
									{ podcastState === 'loading' &&
										<IonSkeletonText animated={true} style={{ width: '90vw', height: 26 }}></IonSkeletonText>
									}
									{ podcastState === 'loaded' &&
										<>
										<div className="ion-text-wrap">
											{podcastData?.name}
											</div>
										</>
									}
								</IonTitle>
							</IonToolbar>
						</IonHeader>
						<div className="podcastInfo">
							<Link
								to={{
									pathname: '/podcast/' + podcastData.path + '/reviews/',
									state: {
										podcast: podcastData,
										backButtonText: podcastData.name
									}
								}}
								className='reviewStarsLink'
							>
								<ReviewStarsWithText rating={podcastData.review_totalScore} reviews={podcastData.review_totalCount} />
							</Link>
							<div>
								{ podcastState === 'loading' &&
									<div className="description">
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
									</div>
								}
								{ (podcastState === 'loaded' && podcastData.description) &&
									<div className="description">
										<ReadMoreReact
											text={podcastData.safeDescription ? podcastData.safeDescription : podcastData.description}
											readMoreText='...more'
											min={100}
											ideal={150}
											max={250}
										/>
									</div>
								}
							</div>
						</div>
						<div className="actionButtons" ref={actionButtonsRef}>
							{ podcastIsFollowed !== false &&
								<IonButton fill="outline" id="followButton" onClick={onUnfollowPodcast}>
									<IonIcon slot="start" icon={followIcon}></IonIcon>
									Unfollow
								</IonButton>
							}
							{ podcastIsFollowed === false &&
								<IonButton id="followButton" onClick={onFollowPodcast}>
									<IonIcon slot="start" icon={followIcon}></IonIcon>
									Follow
								</IonButton>
							}
							<IonButton id="lastEpisodeButton" fill={podcastIsFollowed === true ? 'solid' : 'outline'} onClick={startPlayingPodcast}>
								<IonIcon slot="start" icon={playIcon}></IonIcon>
								{ seasonType === 'episodic' &&
									<>Latest</>
								}
								{ seasonType === 'season' &&
									<>First</>
								}
								{ actionButtonsWidth > 310 &&
									<> episode</>
								}
							</IonButton>
							<IonButton id="moreButton" className="greyButton" onClick={() => {
								var buttons = [];
								
								buttons.push({
									text: 'Go to podcast website',
									icon: websiteIcon,
									data: {
										action: 'website'
									}
								});
								if (podcastData.funding && podcastData.funding.url) {
									buttons.push({
										text: 'Support podcast',
										icon: donateIcon,
										data: {
											action: 'funding'
										}
									});
								}
								buttons.push({
									text: 'Cancel',
									role: 'cancel',
									data: {
										action: 'cancel',
									},
								});


								actionSheetPresent({
									buttons: buttons,
									onWillDismiss: ({ detail }) => {
										if (detail?.data?.action === 'website') {
											window.open(podcastData.link,"_blank");
										}
										else if (detail?.data?.action === 'funding') {
											window.open(podcastData.funding.url,"_blank");
										}
									},
									onDidDismiss: ({ detail }) => {
										console.log('pressed action sheet button');
										console.log(detail);
									},
								})
							}}><IonIcon icon={dotsIcon}></IonIcon></IonButton>
						</div>
						<div>
							{ podcastData.categories && Object.keys(podcastData.categories).map((keyName, keyIndex) => {
								return (
									<IonChip key={'chip' + keyName}>{podcastData.categories[keyName]}</IonChip>
								);
							} ) }
						</div>
					</div>
				</div>
				<div>
					{ (!activeEpisodeIsShownInList && (activePodcast.guid && activePodcast.guid === podcastData.guid)) &&
						<div className="episodeListOuter">
							<h2 className="podcastPageSubHeader">Currently playing</h2>
							<IonList lines="full" inset={false} className="episodeList">
							<EpisodeItem
								key={activeEpisode.guid}
								guid={activeEpisode.guid}
								title={activeEpisode.title}
								description={activeEpisode.description}
								image={activeEpisode.image}
								podcastPath={podcastPath}
								podcastData={podcastData}
								episode={activeEpisode}
								selected={true}
								isActiveEpisode={true}
							/>
							</IonList>
						</div>
					}
					{ liveItems &&
						<LiveEpisodes podcastData={podcastData} liveItems={liveItems} />
					}
					{ podcastState === 'loaded' &&
						<EpisodeList podcastPath={podcastData.path} podcastData={podcastData} episodes={podcastData.episodes} setActiveEpisodeIsShownInList={setActiveEpisodeIsShownInList} />
					}
					{ podcastState === 'loading' &&
						<div className="episodeListOuter">
							<IonSkeletonText animated={true} style={{ width: '400px', height: '100px' }} className="episode"></IonSkeletonText>
							<IonSkeletonText animated={true} style={{ width: '400px', height: '100px' }} className="episode"></IonSkeletonText>
							<IonSkeletonText animated={true} style={{ width: '400px', height: '100px' }} className="episode"></IonSkeletonText>
							<IonSkeletonText animated={true} style={{ width: '400px', height: '100px' }} className="episode"></IonSkeletonText>
						</div>
					}
				</div>

			</div>
			<div className="podcastExtraContent">
				{ persons !== false &&
					<div className="personContainer">
						<h2>Creators and guests behind the podcast</h2>
						<PodcastPersons persons={persons} />
					</div>
				}
				{ podRoll !== false &&
					<div className="personContainer">
						<h2>This podcast recommends</h2>
						<PodRoll podRoll={podRoll} />
					</div>
				}
				{ (false && podcastState === 'loading') &&
					<IonSkeletonText animated={true} className="reviewSpotlight"></IonSkeletonText>
				}
				{ (false && podcastState === 'loaded' && podcastIsFollowed === false) &&
					<div className="reviewSpotlight">
						<div>&quot;This podcast is amazing. I love the way they cover these hard cases.&quot;</div>
						<div>John Doe</div>
					</div>
				}
			</div>

			{/*
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Trending</div>
					<div className='sectionTitle'>Podcasts</div>
				</div>
				<TrendingPodcasts />
			</div>
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Trending</div>
					<div className='sectionTitle'>Podcasts</div>
				</div>
				<TrendingPodcasts />
			</div>
			*/}
		</Page>
	);
};
export default PodcastPage;