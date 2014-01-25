Hero = Class.extend({
	init: function (game) {
		this.game = game;
		this.width = 50;
		this.height = 50;
		this.speedX = Constants.HERO_SPEED_X;
		this.speedY = 0;
	},
	setPosition: function (x, y) {
		this.x = x;
		this.y = y;
	},
	update: function () {
		for (var key in game.keyState) {
			key = parseInt(key);
			switch (key) {
			case Constants.Key.LEFT:
				this.move(-1);
				break;
			case Constants.Key.RIGHT:
				this.move(1);
				break;
			case Constants.Key.SPACE:
				this.jump();
				break;
			}
		}
		this.speedY -= Constants.FRICTION * this.speedY;
		this.speedY += Constants.GRAVITY;
		this.fall();
	},
	draw: function (ctx) {
		ctx.save();
		ctx.fillStyle = '#ff0000';
		var view = game.toViewPos(this.x, this.y);
		ctx.fillRect(view.x - this.width / 2, view.y - this.height, this.width, this.height);
		ctx.restore();
	},
	move: function (direction) {
		this.x += this.speedX * direction;
	},
	jump: function () {
		if (this.speedY) return;
		this.speedY = -Constants.JUMP_SPEED;
	},
	fall: function () {
		// Fall until we intersect with a platform
		this.y += this.speedY;
		if (this.speedY <= 0) return;
		for (var i = 0; i < this.game.platforms.length; i++) {
			var platform = this.game.platforms[i];
			if (this.intersectWithPlatform(platform)) {
				this.y = platform.y;
				this.speedY = 0;
				break;
			}
		}
	},
	intersectWithPlatform: function (platform) {
		var startY = Math.max(this.y - this.height, platform.y);
		var endY = Math.min(this.y, platform.y + platform.height);
		var startX = Math.max(this.x - this.width / 2, platform.x);
		var endX = Math.min(this.x + this.width / 2, platform.x + platform.width);
		return startY < endY && startX < endX;
	}
});
