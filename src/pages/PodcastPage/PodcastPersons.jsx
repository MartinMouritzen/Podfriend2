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
			{ persons.map && persons.map((person) => {
				const personName = person.name ? person.name : person['#text'];
				return (
					<div key={personName} className="person" onClick={() => { goToWebsite(person.href); }}>
						{ person.img && 
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