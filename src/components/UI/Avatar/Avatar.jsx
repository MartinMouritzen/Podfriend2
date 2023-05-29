import React, { useEffect, useState } from 'react';

var randomColor = require('randomcolor');

const Avatar = ({ userName, userGuid, width = 45, height = 45 }) => {
	const [imageState,setImageState] = useState('loading');

	const avatarRandomColor = randomColor({
		seed: userGuid,
		luminosity: 'light'
	});

	useEffect(() => {
		setImageState('loading');

		var avatarImage = new Image();
		avatarImage.src = 'https://api.podfriend.com/user/avatar/' + userGuid + '.jpg';
		avatarImage.onload = () => {
			console.log('avatar loaded');
			setImageState('loaded');
		};
		avatarImage.onerror = () => {
			console.log('avatar error');
			setImageState('error');
		};
	},[]);

	return (
		<>
			{ imageState === 'loading' || imageState === 'error' &&
				<div style={{
					width: width,
					height: height,
					overflow: 'hidden',
					borderRadius: '50%',
					backgroundColor: avatarRandomColor
				}}>
					&nbsp;
				</div>
			}
			{ imageState === 'loaded' &&
				<img
					src={'https://api.podfriend.com/user/avatar/' + userGuid + '.jpg'}
					style={{
						width: width,
						height: height,
						borderRadius: '50%'
					}}
				/>
			}
		</>
	);
}
export default Avatar;