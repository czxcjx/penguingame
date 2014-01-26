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
		var view = game.toViewPos(this.x, this.y);
		if (this.portal) {
			ctx.drawImage(game.portalImage, view.x + this.width / 2 - this.portalsize / 2,
				view.y - this.portalsize/2, this.portalsize,this.portalsize);
		}
		if (this !== game.hero.currentPlatform) return;
		ctx.strokeRect(view.x, view.y, this.width, this.height);
	},
	addPortal: function (otherPlatform) {
		this.portal = otherPlatform;
		this.portalsize = Constants.PORTAL_SIZE;
	}
});
