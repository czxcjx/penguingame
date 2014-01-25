Util = {
	getBase64Image: function (src) {
		return 'data:image/png;base64,' + src;
	}
};
Util.Math = {
	randInt: function (a, b) {
		return Math.floor(Math.random() * (b - a + 1)) + a;
	}
};