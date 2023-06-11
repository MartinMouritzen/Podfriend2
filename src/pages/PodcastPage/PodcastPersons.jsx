import React from 'react';

import './PodcastPersons.scss';

const PodcastPersons = ({ persons }) => {
	const goToWebsite = (website) => {
		if (!website) {
			return false;
		}
		window.open(website,"_blank");
	}

	return (
		<div className="persons">
			{ persons.map && persons.map((person,index) => {
				const personName = person.name ? person.name : person['#text'];
				return (
					<div key={personName + person.role} className="person" onClick={() => { goToWebsite(person.href); }}>
						{ !person.hasOwnProperty('img') &&
							<img src='https://ionicframework.com/docs/img/demos/avatar.svg' className="photo" style={{ minWidth: 40, minHeight: 40, maxWidth: 40, maxHeight: 40}} />
						}
						{ person.hasOwnProperty('img') && 
							<img src={person.img} className="photo" />
						}
						<div className="name">
							{personName}
						</div>
						{ person.role &&
							<div className="role">
								{person.role}
							</div>
						}
					</div>
				)
			}) }
		</div>
	);
}
export default PodcastPersons;