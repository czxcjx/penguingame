Platform = Class.extend({
	init: function (x, y, width, height, src) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.image = new Image();
		this.image.src = src;
	},
	draw: function (ctx) {
		ctx.save();
		ctx.fillStyle = '#000000';
		var view = game.toViewPos(this.x, this.y);
		//ctx.fillRect(view.x, view.y, this.width, this.height);
		ctx.drawImage(this.image, view.x, view.y);
		ctx.restore();
	}
});