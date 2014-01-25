Platform = Class.extend({
	init: function (x, y, width, height, href) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.href = href;
	},
	drawMask: function (ctx) {
		var view = game.toViewPos(this.x, this.y);
		ctx.fillRect(view.x, view.y, this.width, this.height);
	},
	draw: function (ctx) {
		if (this !== game.hero.currentPlatform) return;
		var view = game.toViewPos(this.x, this.y);
		ctx.strokeRect(view.x, view.y, this.width, this.height);
	}
});
