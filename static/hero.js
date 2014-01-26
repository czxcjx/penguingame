Hero = Class.extend({
	init: function () {
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
			case Constants.Key.DOWN:
				this.drop();
				break;
			case Constants.Key.ENTER:
				this.enter(this.currentPlatform.href);
				break;
			case Constants.Key.UP:
				if (this.currentPlatform && this.currentPlatform.portal) {
					var otherPlatform = this.currentPlatform.portal;
					this.y = otherPlatform.y;
					this.x = otherPlatform.x + otherPlatform.width / 2;
					this.currentPlatform = otherPlatform;
				}
				break;
			case Constants.Key.SPACE:
				this.jump();
				break;
			}
		}
		this.speedY -= Constants.FRICTION * this.speedY;
		this.speedY += Constants.GRAVITY;
		this.y += this.speedY;
		if (this.y > game.page.height) this.y = 0;
		if (this.speedY > 0) {
			this.checkPlatformCollision();
		}
	},
	draw: function (ctx) {
		ctx.save();
		ctx.fillStyle = '#ff0000';
		var view = game.toViewPos(this.x, this.y);
		ctx.fillRect(view.x - this.width / 2, view.y - this.height, this.width, this.height);
		ctx.restore();
	},
	drop: function () {
		if (!this.currentPlatform) return;
		this.currentPlatform.disabled = true;
	},
	enter: function (href) {
		game.run(href);
	},
	move: function (direction) {
		this.x += this.speedX * direction;
	},
	jump: function () {
		if (this.speedY) return;
		this.speedY = -Constants.JUMP_SPEED;
		this.currentPlatform = null;
		for (var i = 0; i < game.platforms.length; i++) {
			var platform = game.platforms[i];
			platform.disabled = false;
		}
	},
	checkPlatformCollision: function () {
		var prevY = this.y - this.speedY;
		// Fall until we intersect with a platform
		for (var i = 0; i < game.platforms.length; i++) {
			var platform = game.platforms[i];
			if (prevY <= platform.y && !platform.disabled && this.intersectWithPlatform(platform)) {
				this.y = platform.y;
				this.currentPlatform = platform;
				this.speedY = 0;
				return;
			}
		}
		this.currentPlatform = null;
	},
	intersectWithPlatform: function (platform) {
		var prevY = this.y - this.speedY;
		// Check if vertical line intersects rectangle
		var startY = Math.max(prevY - this.height, platform.y);
		var endY = Math.min(this.y, platform.y + platform.height);
		var startX = Math.max(this.x - this.width / 2, platform.x);
		var endX = Math.min(this.x + this.width / 2, platform.x + platform.width);
		return startY < endY && startX < endX;
	}
});
