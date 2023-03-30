import Page from "components/Page/Page";

import { useRef } from 'react';

import useStore from 'store/Store';

import TrendingPodcasts from "components/Lists/TrendingPodcasts";
import CategoryList from "components/Lists/CategoryList";
import { IonButton, IonButtons, IonHeader, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";

import useBreakpoint from 'use-breakpoint';
import { BREAKPOINTS } from 'constants/breakpoints';
import ContinueListening from "components/Lists/ContinueListeningCarousel";
import CoverCarousel from "components/Lists/CoverCarousel";
import LatestEpisodes from 'components/Lists/LatestEpisodes';

const Home = ({  }) => {
	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const loggedIn = useStore((state) => state.loggedIn);

	const router = useIonRouter();
	const searchBar = useRef(null);

	const onSearch = (event) => {
		event.preventDefault();
		router.push("/search/" + searchBar.current.value)

		return false;
	};

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
			{ loggedIn &&
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
			{ loggedIn &&
				<div className='section'>
					<div className='sectionInner'>
						<div className='sectionSubTitle'>Latest</div>
						<div className='sectionTitle'>episodes</div>
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