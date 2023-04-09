import '@capacitor/core';
import {
  Device
} from '@capacitor/device';

import { useEffect } from 'react';

const DeviceInfo = () => {
	useEffect(() => {
		Device.getInfo()
		.then((info) => {
			console.log('Device info');
			console.log(info);
		});
	},[]);

	return (
		<div>
			test
		</div>
	);
};
export default DeviceInfo;