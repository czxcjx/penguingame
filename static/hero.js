Hero = Class.extend({
	init: function () {
		this.width = 32;
		this.height = 32;
		this.speedX = Constants.HERO_SPEED_X;
		this.speedY = 0;
		this.mod = 0;
		this.smallportal = [];
		this.flyingframes = -1;
	},
	setPosition: function (x, y) {
		this.x = x;
		this.y = y;
	},
	update: function () {
		if (this.currentPlatform && this.currentPlatform.portal) {
			if (this.currentPlatform.portalsize>Constants.PORTAL_SIZE/2) this.currentPlatform.portalsize--;
			if (this.smallportal.indexOf(this.currentPlatform)==-1) this.smallportal.push(this.currentPlatform); 
		}
		this.smallportal = this.smallportal.filter(function(el){return el.portalsize<Constants.PORTAL_SIZE;});
		for (var i = 0; i < this.smallportal.length; i++) {
			if (this.smallportal[i]!=this.currentPlatform) this.smallportal[i].portalsize++;
		}
		if (this.flyingframes>=0) {
			var FRAMES = 7;
			if (this.flyingframes >= FRAMES) {
				this.flyingframes = -1;
				this.x = this.targetx;
				this.y = this.targety;
				return;
			}
			this.flyingframes++;
			this.x += (this.targetx-this.origx)/FRAMES;
			this.y += (this.targety-this.origy)/FRAMES;
			return;
		}
		for (var key in game.keyState) {
			key = parseInt(key);
			switch (key) {
			case Constants.Key.LEFT:
				this.move(-1);
				this.mod = (this.mod+1)%3;
				$('#herodiv').css({"background-position":(this.mod*-32).toString()+" -32"});
				break;
			case Constants.Key.RIGHT:
				this.move(1);
				this.mod = (this.mod+1)%3;
				$('#herodiv').css({"background-position":(this.mod*-32).toString()+" -64"});
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
					this.flyingframes = 0;
					this.targety = otherPlatform.y;
					this.targetx = otherPlatform.x + otherPlatform.width / 2;
					this.origx = this.x;
					this.origy = this.y;
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
		//console.log(this.width," ",this.height);
		//ctx.fillRect(view.x - this.width / 2, view.y - this.height, this.width, this.height);
		if (!$('#herodiv').is(':visible')) $('#herodiv').show();
		$('#herodiv').css({
			width: this.width,
			height: this.height,
			left: view.x - this.width/2,
			top: view.y - this.height,
			//"background-color":"green"
		});
		
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
		this.currentPlatform.portalsize = Constants.PORTAL_SIZE;
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
