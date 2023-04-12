import '@capacitor/core';
import {
  Device
} from '@capacitor/device';

import { useEffect } from 'react';

import { Browser } from '@capacitor/browser';


const DeviceInfo = () => {
	useEffect(() => {
		Device.getInfo()
		.then((info) => {
			console.log('Device info');
			console.log(info);
		});
	},[]);

	const openCapacitorSite = async () => {
		await Browser.open({ url: 'http://capacitorjs.com/' });
	  };

	return (
		<div onClick={openCapacitorSite}>
			test
		</div>
	);
};
export default DeviceInfo;