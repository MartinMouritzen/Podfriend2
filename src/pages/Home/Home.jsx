import Page from "components/Page/Page";

import { useRef } from 'react';

import TrendingPodcasts from "components/Lists/TrendingPodcasts";
import CategoryList from "components/Lists/CategoryList";
import { IonButton, IonButtons, IonHeader, IonSearchbar, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";

import useBreakpoint from 'use-breakpoint';
import { BREAKPOINTS } from 'constants/breakpoints';

const Home = ({  }) => {
	const { breakpoint } = useBreakpoint(BREAKPOINTS, 'desktop');

	const router = useIonRouter();
	const searchBar = useRef(null);

	const onSearch = (event) => {
		event.preventDefault();
		router.push("/search/" + searchBar.current.value)

		return false;
	};

	return (
		<Page id="home" title="Home" showBackButton={false}>
			<IonHeader collapse="condense" class="mainTitleHeader">
				<IonToolbar>
					{ breakpoint !== 'desktop' &&
						<form method="GET" onSubmit={onSearch}>
							<IonSearchbar collapse={true} animated={true} show-clear-button="focus" inputmode="search" placeholder="Search podcasts" ref={searchBar}></IonSearchbar>
						</form>
					}
				</IonToolbar>
			</IonHeader>
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Continue</div>
					<div className='sectionTitle'>listening</div>
				</div>
				<TrendingPodcasts />
			</div>
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Latest</div>
					<div className='sectionTitle'>episodes</div>
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
			<div className='section'>
				<div className='sectionInner'>
					<div className='sectionSubTitle'>Explore</div>
					<div className='sectionTitle'>Categories</div>
				</div>
				<CategoryList />
			</div>
		</Page>
	);
};
export default Home;