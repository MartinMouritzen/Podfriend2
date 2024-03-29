import { useEffect, useState, useContext, useRef } from 'react';

import Page from "components/Page/Page";

import useStore from 'store/Store';

import PodcastList from 'components/Lists/PodcastList';

import sortIcon from 'images/icons/sort.svg';

import { IonSearchbar, IonToolbar, IonHeader, IonTitle, IonButtons, IonButton, IonIcon, useIonActionSheet, IonSpinner, useIonRouter } from '@ionic/react';

import './SearchPage.scss';

import EmptyIllustration from 'images/flow-illustrations/empty.svg';

import {NavContext} from '@ionic/react';

const SearchPage = ({ match }) => {
	const [present] = useIonActionSheet();

	const {navigate} = useContext(NavContext);

	const router = useIonRouter();

	const followedPodcasts = useStore((state) => state.followedPodcasts);

	const searchPodcasts = useStore((state) => state.searchPodcasts);

	const searchBar = useRef(null);
	const [searchString,setSearchString] = useState('');
	const [results,setResults] = useState([]);
	const [searching,setSearching] = useState(false);

	useEffect(() => {
		setSearchString(match.params.searchQuery);
		setResults([]);
	},[match.params.searchQuery]);

	useEffect(() => {
		if (searchString && searchString.length && searchString.length > 2) {
			setResults([]);
			setSearching(true);
			searchPodcasts(searchString,'podcast')
			.then((results) => {
				setResults(results);
				console.log(results);
				setSearching(false);
			})
			.catch((error) => {
				console.log('Error happened while searching');
				console.log(error);
				setSearching(false);
			});
		}
		else {
			setResults([]);
		}
	},[searchString]);


	const onSearch = (event) => {
		event.preventDefault();
		router.push("/search/" + searchBar.current.value)

		return false;
	};

	return (
		<Page title="Search" defaultHeader={false} showBackButton={match.params.searchQuery ? true : false}>
			<IonHeader collapse="condense" class="mainTitleHeader">
				<IonToolbar>
					<IonTitle size="large">Search</IonTitle>
				</IonToolbar>
				<IonToolbar>
					<form method="GET" onSubmit={onSearch}>
						<IonSearchbar ref={searchBar} collapse={true} animated={true} show-clear-button="focus" enterKeyHint="search" inputmode="search" placeholder="Search all podcasts" value={searchString}></IonSearchbar>
					</form>
				</IonToolbar>
			</IonHeader>
			<div className="searchPage">
				{ !searchString || searchString.length <= 2 && 
					<div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
						<h2>Browse categories</h2>
					</div>
				}
				{ searchString && searchString.length && searchString.length > 2 &&
					<div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
						{ (searching || (results && results.length > 0)) &&
							<h2>Results for &quot;{searchString}&quot;</h2>
						}

						{ searching &&
							<div className="loading">
								<IonSpinner name="dots"></IonSpinner>
							</div>
						}
						{ (!searching && results && results.length === 0) &&
							<div className="emptyStatePage" style={{ textAlign: 'center', marginTop: 30 }}>
								<div>
									<img src={EmptyIllustration} />
								</div>
								<IonHeader collapse="condense" class="mainTitleHeader">
									<IonToolbar>
										<IonTitle size="large" style={{ textAlign: 'center'}}>
											<div className="ion-text-wrap">
												No results found
											</div>
										</IonTitle>
									</IonToolbar>
								</IonHeader>
								<h3>
									Sorry, I couldn't find any results for &quot;{searchString}&quot;
								</h3>
							</div>
						}
						{ (results && results.length > 0) &&
							<PodcastList backButtonText="Search" podcasts={results} listType='list' />
						}
					</div>
				}
			</div>
		</Page>
	);
};
export default SearchPage;