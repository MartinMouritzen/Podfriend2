import React from 'react';

import SVG from 'react-inlinesvg';

import PodfriendLogo from 'images/icons/podfriend_logo.svg';

import './CreditCard.scss';
/**
Your current balance is: {(walletBalance).toLocaleString()} Satoshis.
*/
const CreditCard = ({ walletBalance = 0, username = 'Loading' }) => {
	return (
		<div className="card">
			<SVG src={PodfriendLogo} className="logo" />
			<div className="bankName">Podfriend</div>
			<a className="username">{username}</a>
			<div className="chip">
				<div className="side left"></div>
				<div className="side right"></div>
				<div className="vertical top"></div>
				<div className="vertical bottom"></div>
			</div>

			<div className="balance">{walletBalance === false ? 'Loading' : (walletBalance).toLocaleString()}</div>
			<div className="balanceLabel">Satoshi</div>

			<div className="linesDown"></div>
			<div className="linesUp"></div>
		</div>
	);
}
export default CreditCard;