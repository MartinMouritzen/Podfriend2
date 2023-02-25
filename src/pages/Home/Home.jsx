import Page from "components/Page/Page";

import TrendingPodcasts from "components/Lists/TrendingPodcasts";
import CategoryList from "components/Lists/CategoryList";
import { IonButton, IonButtons, IonHeader, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react";

const Home = ({  }) => {
	return (
		<Page id="home" title="Home" showBackButton={false}>
			<IonHeader collapse="condense" class="mainTitleHeader">
				<IonToolbar>
					<IonSearchbar collapse={true} animated={true} show-clear-button="focus" inputmode="search" placeholder="Search podcasts"></IonSearchbar>
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