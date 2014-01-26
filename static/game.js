Game = Class.extend({
	init: function () {
		this.canvas = $('#screen')[0];
		$('canvas').attr('width', 1024).attr('height', 768);
		this.ctx = this.canvas.getContext('2d');
		//this.resizeCanvas();
		//$(window).resize(this.resizeCanvas.bind(this));
		this.keyState = {};
		this.score = 0;
		this.maxcoins = 0;
		this.falls = 0;
		this.tmpCanvas = document.createElement('canvas');
		this.tmpCanvas.width = this.canvas.width;
		this.tmpCanvas.height = this.canvas.height;
		this.tmpCtx = this.tmpCanvas.getContext('2d');
		this.tmpCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		this.addEvents();
		$('body').append($('<div />',{id:"herodiv"}).css({
			position: 'fixed',
			"z-index": 9999,
			"background-image":"url('/static/hero_sprite.png')"
		}));
		$('#herodiv').hide();
	},
	run: function (url) {
		var self = this;
		if (this.gameInterval) clearInterval(this.gameInterval);
		this.state = 'loading';
		this.startLoadTime = Date.now();
		this.draw();
		console.log('called');
		$.getJSON('/query?page=' + url, this.parseJSON.bind(this)).fail(function () {
			self.state = 'loadfail';
		});
		/*
		this.draw();
		setInterval(this.update.bind(this), 1000 / Constants.TICK_RATE);
		*/
	},
	parseJSON: function (data) {
		this.loadedImages = 0;
		this.totalImages = 2;
		this.coins = [];
		this.portalImage = Util.getImage('portal1.gif', this.onImageLoaded.bind(this));
		this.coinImage = Util.getImage('coin.png', this.onImageLoaded.bind(this));
		this.page = Util.getImage(data.bg, this.onImageLoaded.bind(this));
		this.platforms = [];
		for (var i = 0; i < data.links.length; i++) {
			var link = data.links[i];
			this.platforms.push(new Platform(link.x, link.y, link.width, link.height, link.href));
			if (Math.random()<Constants.PORTAL_DENSITY) {
				for (var j = 0; j < link.width; j+=36) {
					this.coins.push({x:link.x+j,y:link.y-16});
					this.maxcoins++;
				}
			}
		}
	},
	onImageLoaded: function () {
		++this.loadedImages;
		if (this.loadedImages === this.totalImages) {
			this.startGame();
		}
	},
	startGame: function () {
		this.state = 'game';
		checkAccessible(this.platforms, Constants.HERO_SPEED_X, Constants.JUMP_SPEED, Constants.GRAVITY, Constants.FRICTION);
		this.viewport = {x: this.canvas.width / 2, y: this.canvas.height / 2};
		this.hero = new Hero();
		this.hero.setPosition(400, 0);
		this.hero.game = this;
		this.gameInterval = setInterval(this.update.bind(this), 1000 / Constants.TICK_RATE);
	},
	update: function () {
		this.hero.update();
		this.updateViewport();
		this.drawScore();
	},
	draw: function () {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		switch (this.state) {
		case 'loading':
			var progress = Math.min(100, Math.round((Date.now() - this.startLoadTime) / 15000 * 100));
			this.drawText('Loading (' + progress + '%)...');
			break;
		case 'loadfail':
			this.drawText('Cannot load page!');
			break;
		case 'game':
			this.drawGame();
			break;
		}
		requestAnimationFrame(this.draw.bind(this));
	},
	drawScore: function () {
		//this.ctx.save();
		//this.ctx.textAlign = 'center';
		//this.ctx.textBaseline = 'middle';
		//this.ctx.font = '30px Tahoma';
		//this.ctx.fillText("Score: " + this.score.toString() + "/" + this.maxcoins.toString(), 20,20);
		//this.ctx.restore();
		var txt = "Score: " + this.score.toString() + "/" + this.maxcoins.toString();
		txt += "<br>Falls: " + this.falls.toString() + "</br>";
		if (this.score%10==0&&this.score!=0) {
			var msges = ["Good Job!", "Keep it up!", "You can do it!", "Don't stop trying!"];
			if (this.rm==-1) this.rm = Math.floor(Math.random()*msges.length);
			txt += "<br>"+msges[this.rm]+"</br>";
		} else {
			this.rm = -1;
		}
		if (this.coins.length==0) {
			txt += "<br>Amazing! Now press Enter on any link to go to another level!</br>";
		}
		if (this.falls==1) {
			txt += "<br>Try not to hit the ground! It hurts!</br>";
		}
		$('#scorediv').html(txt);
	},
	drawGame: function () {
		this.tmpCtx.clearRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
		this.tmpCtx.fillRect(0, 0, this.tmpCanvas.width, this.tmpCanvas.height);
		this.tmpCtx.save();
		this.tmpCtx.globalCompositeOperation = 'destination-out';
		for (var i = 0; i < this.platforms.length; i++) {
			this.platforms[i].drawMask(this.tmpCtx);
		}
		this.tmpCtx.restore();
		this.ctx.drawImage(this.page, this.canvas.width / 2 - this.viewport.x,
			this.canvas.height / 2 - this.viewport.y);
		this.ctx.drawImage(this.tmpCanvas, 0, 0);
		for (var i = 0; i < this.platforms.length; i++) {
			this.platforms[i].draw(this.ctx);
		}
		for (var i = 0; i < this.coins.length; i++) {
			var view = this.toViewPos(this.coins[i].x, this.coins[i].y);
			this.ctx.drawImage(game.coinImage, view.x,view.y,16,16);
		}
		this.hero.draw(this.ctx);
	},
	drawText: function (text) {
		this.ctx.save();
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.font = '30px Tahoma';
		this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
		this.ctx.restore();
	},
	resizeCanvas: function () {
		$('#screen').width($(window).width()).height($(window).height());
	},
	addEvents: function () {
		var self = this;
		$('#screen').off('mousemove').mousemove(function (e) {
		});
		$('#screen').off('click').click(function (e) {
		});
		$('#screen').off('contextmenu').on('contextmenu', function (e) {
		});
		$('#screen').off('mousedown').mousedown(function (e) {
		});
		$('#screen').off('mouseup').mouseup(function (e) {
		});
		$(document).off('keydown').keydown(function (e) {
			self.keyState[e.which] = true;
		});
		$(document).off('keyup').keyup(function (e) {
			delete self.keyState[e.which];
		});
		$(document).off('keypress').keypress(function (e) {
		});
	},
	toViewPos: function (x, y) {
		return {
			x: x - this.viewport.x + this.canvas.width / 2,
			y: y - this.viewport.y + this.canvas.height / 2
		};
	},
	updateViewport: function () {
		this.viewport.x = this.hero.x;
		this.viewport.y = this.hero.y;
	}
});
