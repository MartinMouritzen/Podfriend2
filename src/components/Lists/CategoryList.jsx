import './CategoryList.scss';

import { Link } from 'react-router-dom';

import categories from 'constants/categories';

const CategoryList = () => {
	return (
		<div className={'podcastGrid scroll categoryList'}>
			{ Object.entries(categories).map(([key,value]) => {
				const category = categories[key];
				return (
					
						<Link
							to={{
								pathname: '/categories/' + category.key + '/'
							}}
							className='podcastItemLink'
							
						>
							<div className="category" key={category.name}>
								<div className="categoryPhoto" style={{ backgroundImage: 'url("' + category.image + '")' }}>

								</div>
								<div className="categoryName" style={{ backgroundColor: category.backgroundColor, color: category.color }}>
									{category.name}
								</div>
							</div>
						</Link>
					
				);
			} ) }
		
		</div>
	);
};
export default CategoryList;