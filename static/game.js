Game = Class.extend({
	init: function () {
		this.canvas = $('#screen')[0];
		$('canvas').attr('width', 800).attr('height', 600);
		this.state = 'loading';
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
		$(window).resize(this.resizeCanvas.bind(this));
		this.keyState = {};
		this.viewport = {x: this.canvas.width / 2, y: this.canvas.height / 2};
		this.hero = new Hero(this);
		this.hero.setPosition(400, 0);
		this.addEvents();
	},
	run: function () {
		var url = 'http://www.google.com';
		$.getJSON('/query?page=' + url, this.parseJSON.bind(this)).fail(function () {
			alert('Cannot load page!');
		});
		/*
		this.draw();
		setInterval(this.update.bind(this), 1000 / Constants.TICK_RATE);
		*/
		this.draw();
	},
	parseJSON: function (data) {
		this.page = new Image();
		this.page.src = data.bg;
		this.platforms = [];
		for (var i = 0; i < data.links.length; i++) {
			var link = data.links[i];
			this.platforms.push(new Platform(link.x, link.y, link.width, link.height, link.src));
		}
		this.state = 'game';
		/*
			this.platforms.push(new Platform(570, 300, 100, 20));
			this.platforms.push(new Platform(300, 100, 100, 20));
			this.platforms.push(new Platform(300, 500, 100, 20));
		*/
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
			this.drawLoader();
			break;
		case 'game':
			this.drawGame();
			break;
		}
		requestAnimationFrame(this.draw.bind(this));
	},
	drawLoader: function () {
		this.ctx.save();
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.font = '30px Tahoma';
		this.ctx.fillText('Loading...', this.canvas.width / 2, this.canvas.height / 2);
		this.ctx.restore();
	},
	drawGame: function () {
		this.ctx.drawImage(this.page, 0, 0);
		for (var i = 0; i < this.platforms.length; i++) {
			this.platforms[i].draw(this.ctx);
		}
		this.hero.draw(this.ctx);
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
