import { IonHeader, IonToolbar, IonTitle, IonSkeletonText, IonButton, IonIcon, IonRefresher, IonRefresherContent, useIonActionSheet, IonItem } from "@ionic/react";
import Page from "components/Page/Page";
import PodcastImage from "components/PodcastImage/PodcastImage";
import { useState, useEffect, useRef } from "react";

import './PodcastPage.scss';

import { ReviewStarsWithText } from "components/Reviews/StarRating";

import useStore from 'store/Store';

import ReadMoreReact from 'read-more-react';

import LoadingRings from 'images/loading/loading-rings.svg';

import followIcon from 'images/icons/plus-circle.svg';
import playIcon from 'images/icons/play-circle.svg';
import dotsIcon from 'images/icons/dots.svg';
import { autoUpdater } from "electron";

import useDimensions from "react-use-dimensions";
import EpisodeList from "./EpisodeList";
import PodcastPersons from "./PodcastPersons";
import RSSFeed from "library/RSSFeed";

const PodcastPage = ({ match }) => {
	const [actionButtonsRef, { x, y, width: actionButtonsWidth }] = useDimensions();

	const activePodcast = useStore((state) => state.activePodcast);

	const getPodcastFromCache = useStore((state) => state.getPodcastFromCache);
	const shouldPodcastUpdate = useStore((state) => state.shouldPodcastUpdate);
	const retrievePodcastFromServer = useStore((state) => state.retrievePodcastFromServer);
	const retrieveOriginalPodcastFeed = useStore((state) => state.retrieveOriginalPodcastFeed);
	const followPodcast = useStore((state) => state.followPodcast);
	const unfollowPodcast = useStore((state) => state.unfollowPodcast);
	const isPodcastFollowed = useStore((state) => state.isPodcastFollowed);

	const [podcastSeasonType,setPodcastSeasonType] = useState('episodic');

	const podcastPath = match.params.podcastPath;

	const [podcastRSSData,setPodcastRSSData] = useState(false);

	const [podcastIsFollowed,setPodcastIsFollowed] = useState(false);
	const [podcastState,setPodcastState] = useState('loading');
	const [error,setError] = useState(false);
	const [podcastData,setPodcastData] = useState(false);

	const [location,setLocation] = useState(false);
	const [showLocation,setShowLocation] = useState(false);
	const [showReviews,setShowReviews] = useState(false);

	const [persons,setPersons] = useState(false);

	const [actionSheetPresent] = useIonActionSheet();

	const podcastPane = useRef(null);

	const onFollowPodcast = () => {
		followPodcast(podcastData);
		setPodcastIsFollowed(true);
	};
	const onUnfollowPodcast = () => {
		console.log(podcastData);
		unfollowPodcast(podcastData);
		setPodcastIsFollowed(false);
	};

	useEffect(() => {
		console.log('time to get live RSS data');
	},[podcastData.url]);

	useEffect(() => {
		if (activePodcast.path === podcastPath) {
			setPodcastData(activePodcast);
			setPodcastState('loaded');
		}
	},[activePodcast]);

	// console.log(podcastData.rssFeedContents);

	useEffect(() => {
		setPodcastRSSData(podcastData.rssFeedContents);
	},[podcastData.rssFeedContents?.uuid]);

	useEffect(() => {
		console.log('Original RSS Feed contents changed');
		console.log(podcastRSSData);

		if (!podcastRSSData) {
			setPersons(false);
			setLocation(false);
			return;
		}
		if (podcastRSSData.location) {
			// console.log('Feed has location');
			// console.log(podcastRSSData.location);
			setLocation(podcastRSSData.location);
		}
		else {
			setLocation(false);
		}
		if (podcastRSSData.persons) {
			// console.log('Feed has persons');
			// console.log(podcastRSSData.persons);
			setPersons(podcastRSSData.persons);
		}
		else {
			console.log('Feed doesn\'t have persons');
			setPersons(false);
		}
	},[podcastRSSData]);

	const loadPodcast = async (podcastPath) => {
		setPodcastState('loading');
		setPodcastData(false);

		try {
			if (activePodcast.path === podcastPath) {
				setPodcastData(activePodcast);
				setPodcastState('loaded');
			}
			else {
				getPodcastFromCache(podcastPath)
				.then((podcastCache) => {
					console.log('PodcastCache: ');
					console.log(podcastPath);
					console.log(podcastCache);
					if (podcastCache) {
						setPodcastData(podcastCache);
						setPodcastState('loaded');
					}
					var shouldUpdate = shouldPodcastUpdate(podcastCache);
			
					if (shouldUpdate) {
						retrievePodcastFromServer(podcastPath,podcastCache)
						.then((podcastDataFromServer) => {
							setPodcastData(podcastDataFromServer);
							setPodcastState('loaded');
						})
						.catch((error) => {
							console.log('Error2 fetching podcast in PodcastPage::fetchPodcast: ' + error);
							console.log('We should not dispatch a redux error if this is an abort.');
							console.log(error);
							
							throw error;
						});
					}
				})
				.catch((exception) => {
					setPodcastState('error');
					console.log('Error in getPodcast (2)');
					console.log(exception);
				});
			}
		}
		catch (exception) {
			setPodcastState('error');
			console.log('Error in getPodcast');
			console.log(exception);
		}
	};

	useEffect(() => {
		if (podcastState === 'loaded') {
			retrieveOriginalPodcastFeed(podcastData)
			.then((feed) => {
				console.log('new original feed');
				console.log(feed);
				setPodcastRSSData(feed);
			});
		}
	},[podcastState]);

	useEffect(() => {
		// Scroll to the top when podcast changes. Otherwise we risk weird behaviour if the user scrolled on a previous podcast page
		setTimeout(() => {
			if (podcastPane && podcastPane.current && podcastPane.current.scrollToTop) {
				podcastPane.current.scrollToTop(0);
			}
		},50);
		setPodcastState('loading');
		setPodcastData(false);
		setPodcastRSSData(false);
		setError(false);
		loadPodcast(podcastPath);
		setPodcastIsFollowed(isPodcastFollowed(podcastPath));
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
		console.log('Begin async operation');
	  
		setTimeout(() => {
		  console.log('Async operation has ended');
		  event.detail.complete();
		}, 2000);
	}


	useEffect(() => {
		/*
		let seasonCount = 0;
		let rawSeasons = [];
		let trailers = [];

		if (Array.isArray(podcastData.episodes)) {
			podcastData.episodes.forEach((episode,index) => {
				var seasonNumber = 0;

				var episodeSeason = parseInt(episode.season);

				if (episode.episodeType === 'trailer') {
					trailers.push(episode);
				}
				else {
					if (Number.isInteger(episodeSeason)) {
						seasonNumber = episodeSeason;
					}
					if (!Array.isArray(rawSeasons[seasonNumber])) {
						rawSeasons[seasonNumber] = [];
					}
					rawSeasons[seasonNumber].push(episode);
				}
			});
			let seasonNumbers = Object.keys(rawSeasons);
			seasonCount = rawSeasons.length;

			// If it's a seasonal podcast, we want to sort old to new
			if (seasonCount > 1) {
				setPodcastSeasonType('season');
			}
			else {
				setPodcastSeasonType('episodic');
			}
		}
		*/
	},[podcastData.episodes]);

	return (
		<Page defaultHeader={false} title={podcastData ? podcastData.name : 'Loading...'} className="podcastPage" contentRef={podcastPane}>
			<IonRefresher slot="fixed" onIonRefresh={doRefresh}>
				<IonRefresherContent>
				</IonRefresherContent>
			</IonRefresher>
			<div className="podcastPageContent">
				<div className="podcastHeader">
					<div className="coverHolder">
						{ podcastState === 'loading' &&
							<IonSkeletonText animated={true} style={{ width: '90vw', height: '90vw', maxWidth: '400px', maxHeight: '400px' }} className="cover"></IonSkeletonText>
						}
						{ podcastState === 'loaded' &&
							<PodcastImage
								alt={podcastData.name + ' cover art'}
								imageErrorText={podcastData.name}
								podcastPath={podcastData.path}
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
					<div style={{ flex: 1 }}>
						<IonHeader collapse="condense">
							<IonToolbar>
								<IonTitle size="large">
									{ podcastState === 'loading' &&
										<IonSkeletonText animated={true} style={{ width: '90vw', height: 26 }}></IonSkeletonText>
									}
									{ podcastState === 'loaded' &&
										<>
										<div className="ion-text-wrap">
											{podcastData.name}
											</div>
										</>
									}
								</IonTitle>
							</IonToolbar>
						</IonHeader>
						<div className="podcastInfo">
							{ false && podcastState === 'loading' &&
								<IonSkeletonText animated={true} style={{ width: 250, height: 20 }}></IonSkeletonText>
							}
							{ false && podcastState === 'loaded' &&
								<div className="author">
									{podcastData.author}
								</div>
							}
							<div>
								{ podcastState === 'loading' &&
									<div className="description">
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
										<IonSkeletonText animated={true} style={{ width: '100%', height: 20 }}></IonSkeletonText>
									</div>
								}
								{ podcastState === 'loaded' &&
									<div className="description">
										<ReadMoreReact
											text={podcastData.description}
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
								<IonButton id="followButton" onClick={onUnfollowPodcast}>
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
							<IonButton id="lastEpisodeButton" fill="outline">
								<IonIcon slot="start" icon={playIcon}></IonIcon>
								{ podcastSeasonType === 'episodic' &&
									<>Latest</>
								}
								{ podcastSeasonType === 'season' &&
									<>First</>
								}
									{ actionButtonsWidth > 310 &&
										<> episode</>
									}
							</IonButton>
							<IonButton id="moreButton" className="greyButton" onClick={() => {
								actionSheetPresent({
									buttons: [
									{
										text: 'Add season to playlist',
										data: {
										action: 'share',
										},
									},
									{
										text: 'Cancel',
										role: 'cancel',
										data: {
										action: 'cancel',
										},
									},
									],
									onDidDismiss: ({ detail }) => {
										console.log('pressed action sheet button');
										console.log(detail);
									},
								})
							}}><IonIcon icon={dotsIcon}></IonIcon></IonButton>
						</div>
					</div>
				</div>
				<EpisodeList podcastPath={podcastData.path} podcastData={podcastData} episodes={podcastData.episodes} />

			</div>
			<div className="podcastExtraContent">
				{ persons !== false &&
					<div className="personContainer">
						<h2>Creators and guests behind the podcast</h2>
						<PodcastPersons persons={persons} />
					</div>
				}
				{ podcastState === 'loading' &&
					<IonSkeletonText animated={true} className="reviewSpotlight"></IonSkeletonText>
				}
				{ podcastState === 'loaded' && podcastIsFollowed === false &&
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