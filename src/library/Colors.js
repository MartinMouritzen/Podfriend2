var randomColor = require('randomcolor');

const colorList = [
	{
		backgroundColor: '#173f5f',
		textColor: 'rgba(255,255,255,0.9)'
	},
	{
		backgroundColor: '#3caea3',
		textColor: 'rgba(0,0,0,0.9)'
	},
	{
		backgroundColor: '#f6d55c',
		textColor: 'rgba(0,0,0,0.9)'
	},
	{
		backgroundColor: '#ed553b',
		textColor: 'rgba(0,0,0,0.9)'
	},
	{
		backgroundColor: '#20639b',
		textColor: 'rgba(255,255,255,0.9)'
	},
];
var currentColor = -1;

class Colors {
	static getRandomColor(seedPhrase) {
		currentColor++;
		if (currentColor >= colorList.length) {
			currentColor = 0;
		}
		return colorList[currentColor];
		return randomColor({
			seed: seedPhrase,
			luminosity: 'bright',
			format: 'rgba',
			alpha: 0.8
		})
	}
}
export default Colors;