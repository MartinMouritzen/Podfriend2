import Page from "components/Page/Page";

import { useRef, useEffect } from 'react';

import useStore from 'store/Store';

import TrendingPodcasts from "components/Lists/TrendingPodcasts";
import CategoryList from "components/Lists/CategoryList";
import { IonButton, IonButtons, IonHeader, IonSearchbar, IonSpinner, IonTitle, IonToolbar, IonContent, useIonRouter, useIonModal, useIonPopover  } from "@ionic/react";

import useBreakpoint from 'use-breakpoint';
import { BREAKPOINTS } from 'constants/breakpoints';
import ContinueListening from "components/Lists/ContinueListeningCarousel";
import OtherUsersListensToCarousel from "components/Lists/OtherUsersListensToCarousel";
import CoverCarousel from "components/Lists/CoverCarousel";
import LatestEpisodes from 'components/Lists/LatestEpisodes';
import DeviceInfo from "components/DeviceInfo";

import NewUserOnboardingModal from "components/Onboarding/NewUser/NewUserOnboardingModal";

const Popover = () => <IonContent className="ion-padding">Hello World!</IonContent>;

const Home = ({  }) => {
	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const loggedIn = useStore((state) => state.loggedIn);
	const refreshingLatestEpisodes = useStore((state) => state.refreshingLatestEpisodes);
	const followedPodcasts = useStore((state) => state.followedPodcasts);
	const seenPodfriendOnboarding = useStore((state) => state.seenPodfriendOnboarding);
	
	const continueListeningEpisodeList = useStore((state) => state.continueListeningEpisodeList);

	const router = useIonRouter();
	const searchBar = useRef(null);

	const onSearch = (event) => {
		event.preventDefault();
		router.push("/search/" + searchBar.current.value)

		return false;
	};

	const [popOverPresent, popOverDismiss] = useIonPopover(Popover, {
		onDismiss: (data, role) => popOverDismiss(data, role),
	});

	const [onboardingPresent, onboardingDismiss] = useIonModal(NewUserOnboardingModal, {
		dismiss: (data, role) => { onboardingDismiss(data, role); },
	});

	const openOnboardingModal = () => {
		onboardingPresent({
			id: 'onboardingModal',
			canDismiss: true,
			breakpoints: breakpoint === 'desktop' ? undefined : [0,1],
			initialBreakpoint: breakpoint === 'desktop' ? undefined : 1,
			onWillDismiss: (event) => {
				/*
				popOverPresent({
					side: 'bottom',
					alignment: 'center'
				});
				*/
			},
		  });
	};

	useEffect(() => {
		if (!seenPodfriendOnboarding) {
			openOnboardingModal();
		}
	},[seenPodfriendOnboarding]);

	return (
		<Page id="home" title="Home" showBackButton={false}>
			{ breakpoint !== 'desktop' &&
				<IonHeader collapse="condense" class="mainTitleHeader">
					<IonToolbar>
							<form method="GET" onSubmit={onSearch}>
								<IonSearchbar collapse={true} animated={true} show-clear-button="focus" inputmode="search" placeholder="Search podcasts" ref={searchBar}></IonSearchbar>
							</form>
						
					</IonToolbar>
				</IonHeader>
			}
			{ /*<DeviceInfo /> */ }
			{ continueListeningEpisodeList.length > 0 &&
				<div className='section noPadding'>
					<div className='sectionInner'>
						<div className='sectionSubTitle'>Continue</div>
						<div className='sectionTitle'>listening</div>
					</div>
					<div className="sectionContents noPadding">
						<ContinueListening backButtonText="Home" />
					</div>
				</div>
			}
			{ (loggedIn && Object.keys(followedPodcasts).length > 0) &&
				<div className='section'>
					<div className='sectionInner'>
						<div className='sectionSubTitle'>Latest</div>
						<div className='sectionTitle'>episodes
							{ refreshingLatestEpisodes &&
								<IonSpinner name="dots" />
							}
						</div>
					</div>
					<div className="sectionContents noPadding">
						<LatestEpisodes backButtonText="Home" />
					</div>
				</div>
			}
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Trending</div>
					<div className='sectionTitle'>Podcasts</div>
				</div>
				<div className="sectionContents">
					<TrendingPodcasts backButtonText="Home" />
				</div>
			</div>
			<div className='section noPadding'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Latest listened</div>
					<div className='sectionTitle'>by others</div>
				</div>
				<div className="sectionContents noPadding">
					<OtherUsersListensToCarousel />
				</div>
			</div>
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Explore</div>
					<div className='sectionTitle'>Categories</div>
				</div>
				<div className="sectionContents">
					<CategoryList backButtonText="Home" />
				</div>
			</div>
			<div style={{ height: 80 }}></div>
		</Page>
	);
};
export default Home;