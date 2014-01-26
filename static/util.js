Util = {
	getImage: function (src, callback) {
		var image = new Image();
		image.src = src + '?t=' + Date.now();
		image.onload = callback;
		return image;
	},
	getBase64Image: function (src, callback) {
		var image = new Image();
		image.src = 'data:image/png;base64,' + src;
		image.onload = callback;
		return image;
	}
};
Util.Math = {
	randInt: function (a, b) {
		return Math.floor(Math.random() * (b - a + 1)) + a;
	}
};