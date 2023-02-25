import './CategoryList.scss';

const CategoryList = () => {
	const categories = [
		{
			name: 'True Crime',
			image: 'https://web.podfriend.com/images/categories/true-crime-muppet2-400x400.png',
			backgroundColor: 'rgba(255,0,0,0.7)',
			color: '#ffffff'
		},
		{
			name: 'Arts',
			image: 'https://web.podfriend.com/images/categories/arts-400x400.png',
			backgroundColor: 'rgba(50,50,255,0.7)',
			color: '#ffffff'
		},
		{
			name: 'Business',
			image: 'https://web.podfriend.com/images/categories/business-400x400.png',
			backgroundColor: 'rgba(100,150,10,0.9)',
			color: '#ffffff'
		},
		{
			name: 'Comedy',
			image: 'https://web.podfriend.com/images/categories/comedy-400x400.png',
			backgroundColor: 'rgba(195,195,0,0.9)',
			color: '#ffffff'
		},
		{
			name: 'Education',
			image: 'https://web.podfriend.com/images/categories/education-400x400.png',
			backgroundColor: 'rgba(255,0,0,0.7)',
			color: '#ffffff'
		},
		/*
		{
			name: 'Fiction',
			image: 'https://web.podfriend.com/images/categories/true-crime.png',
			backgroundColor: 'rgba(255,0,0,0.7)',
			color: '#ffffff'
		},
		{
			name: 'Government',
			image: 'https://web.podfriend.com/images/categories/true-crime.png',
			backgroundColor: 'rgba(255,0,0,0.7)',
			color: '#ffffff'
		},
		{
			name: 'History',
			image: 'https://web.podfriend.com/images/categories/true-crime.png',
			backgroundColor: 'rgba(255,0,0,0.7)',
			color: '#ffffff'
		}
		*/
	];

	return (
		<div className="categoryList">
			{ categories.map((category) => {
				return (
					<div className="category" key={category.name}>
						<div className="categoryPhoto" style={{ backgroundImage: 'url("' + category.image + '")' }}>

						</div>
						<div className="categoryName" style={{ backgroundColor: category.backgroundColor, color: category.color }}>
							{category.name}
						</div>
					</div>
				);
			} ) }
		
		</div>
	);
};
export default CategoryList;