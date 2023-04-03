class TimeUtil {
	/**
	*
	*/
	static secondsToHms(d) {
		d = Number(d);
		var h = Math.floor(d / 3600);
		var m = Math.floor(d % 3600 / 60);
		var s = Math.floor(d % 3600 % 60);
		
		return [h,m,s];
	}
	/**
	*
	*/
	static HmsToSeconds(hms) {
		var p = hms.split(':'),
        s = 0, m = 1;

		while (p.length > 0) {
			s += m * parseInt(p.pop(), 10);
			m *= 60;
		}

		return s;
	}
	/**
	*
	*/
	static formatPrettyDurationText(duration) {
		let [h,m,s] = TimeUtil.secondsToHms(duration);
		
		if (isNaN(h)) {
			h = 0;
		}
		if (isNaN(m)) {
			m = 0;
		}
		if (isNaN(s)) {
			s = 0;
		}
		
		var timeUnits = [];
		/*
		if (h > 0) {
			timeUnits.push(h + 'h');
		}
		if (m > 0) {
			timeUnits.push(m + 'm');
		}
		if (h <= 0 && m <= 0) {
			timeUnits.push(s + 's');
		}
		*/
		if (h > 0) {
			timeUnits.push(('' + h).padStart(2,'0'));
		}
		if (h > 0 || m > 0) {
			
		}
		timeUnits.push(('' + m).padStart(2,'0'));
		timeUnits.push(('' + s).padStart(2,'0'));
		return timeUnits.join(':');
	}
	static fancyTimeFormat(duration,dividerSymbol = ":") {
		// Hours, minutes and seconds
		var hrs = ~~(duration / 3600);
		var mins = ~~((duration % 3600) / 60);
		var secs = ~~duration % 60;
	
		// Output like "1:01" or "4:03:59" or "123:03:59"
		var ret = "";
	
		if (hrs > 0) {
			ret += "" + hrs + dividerSymbol + (mins < 10 ? "0" : "");
		}
	
		ret += "" + mins;

		ret += dividerSymbol + (secs < 10 ? "0" : "");
		ret += "" + secs;
		return ret;
	}
	static fancyTimeLeft(duration) {
		// Hours, minutes and seconds
		var hrs = ~~(duration / 3600);
		var mins = ~~((duration % 3600) / 60);
		var secs = ~~duration % 60;
	
		// Output like "1:01" or "4:03:59" or "123:03:59"
		var ret = "";
	
		if (hrs > 0) {
			ret += "" + hrs + " h " + (mins < 10 ? "0" : "");
		}
		if (mins > 0) {
			ret += "" + mins + " min ";
		}
		if (hrs == 0 && mins == 0) {
			ret += "" + secs + " seconds";
		}
		return ret;
	}
}
module.exports = TimeUtil;