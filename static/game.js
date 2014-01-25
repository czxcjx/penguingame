Game = Class.extend({
	init: function () {
		this.canvas = $('#screen')[0];
		$('canvas').attr('width', 1024).attr('height', 768);
		this.state = 'loading';
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
		$(window).resize(this.resizeCanvas.bind(this));
		this.keyState = {};
		this.addEvents();
	},
	run: function () {
		var self = this;
		this.draw();
		var url = 'en.wikipedia.org/wiki/Web_page';
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
		this.page = Util.getBase64Image(data.bg, this.onImageLoaded.bind(this));
		this.platforms = [];
		for (var i = 0; i < data.links.length; i++) {
			var link = data.links[i];
			this.platforms.push(new Platform(link.x, link.y, link.width, link.height,
				Util.getBase64Image(link.img, this.onImageLoaded.bind(this))));
		}
		this.totalImages = 1 + data.links.length;
	},
	onImageLoaded: function () {
		++this.loadedImages;
		if (this.loadedImages === this.totalImages) {
			this.startGame();
		}
	},
	startGame: function () {
		this.state = 'game';
		this.viewport = {x: this.canvas.width / 2, y: this.canvas.height / 2};
		this.hero = new Hero(this);
		this.hero.setPosition(400, 0);
		setInterval(this.update.bind(this), 1000 / Constants.TICK_RATE);
	},
	update: function () {
		this.hero.update();
		this.updateViewport();
	},
	draw: function () {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		switch (this.state) {
		case 'loading':
			var progress = this.totalImages ? Math.round(this.loadedImages / this.totalImages * 100) : 0;
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
	drawGame: function () {
		this.ctx.globalAlpha = 0.2;
<<<<<<< HEAD
		this.ctx.drawImage(this.page, this.canvas.width / 2 - this.viewport.x,
			this.canvas.height / 2 - this.viewport.y);
=======
		this.ctx.drawImage(this.page, -this.viewport.x + this.canvas.width / 2,
			-this.viewport.y + this.canvas.height / 2);
		this.ctx.globalAlpha = 1;
>>>>>>> 2d2907ff923bdb6efad333758793afb96a53db38
		for (var i = 0; i < this.platforms.length; i++) {
			this.platforms[i].draw(this.ctx);
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
