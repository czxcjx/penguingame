var phantom = require('node-phantom');
var http = require('http');
var url = require('url');
var gm = require('gm');
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
app.get("/",function(req,res){
	res.sendfile("static\\index.html");
});
app.get("/query",function(req,res){
	if (!req.query || !req.query['page']) return res.status(404).render('error404');
	genPhantom(req.query['page'],res);
});
app.use('/static',express.static(__dirname+'\\static'));
var port = 80;
app.listen(port,function(){
	console.log("Express listening on "+port);
});

/*
http.createServer(function(req,res){
	var t = url.parse(req.url,true);
	var pathname = path.normalize(t.pathname);
	//console.log(t);
	console.log(path.dirname(pathname));	
	console.log(pathname);
	if (path.dirname(pathname)=='\\') {
		if (pathname=='\\') {
			static_server.serveFile('/index.html',200,{},req,res);
		} else if (pathname=="\\query") {
			if (!t.query || !t.query['url']) {
				res.writeHead(404,"Not found",{'Content-Type':'text/html'});
				res.end("<html><head><title>Not Found!</title></head><body>Not Found!</body></html>");
				return;
			}
			var u = t.query['url'];
			genPhantom(u,res);
		}
	} else if (path.dirname(pathname)=='\\static') {
		static_server.serve(req,res);
	} else {
		res.writeHead(404,"Not Found",{'Content-Type':'text/html'});
		res.end("<html><head><title>Not Found!</title></head><body>Not Found!</body></html>");
		return;
	}
}).listen(80);
console.log("Listening on port 80...");
*/
function genPhantom(u,res) {
	console.log("u:",u);
	res.writeHead(200,"OK",{'Content-Type':"application/json"});
	phantom.create(function(err,ph){
		return ph.createPage(function(err,page){
			return page.set('viewportSize',{width:1024,height:768},function(err) {
				//var prs = url.parse(u);
				//var u2 = prs.protocol+"://"+prs.host+'/'+encodeURI(prs.path.slice(1));
				return page.open(u, function(err,status){
					console.log("opened site? ",status);
					console.log(u);
					page.injectJs("static\\jquery.js", function(err) {
						setTimeout(function(){
						page.onConsoleMessage = function (msg){
							console.error(msg);     
						};  
							return page.evaluate(function(){
								var ret = [];
								//console.log(ret);
								//flag=false;
								var ctr = 0;
								$('a').each(function(){
									//console.log(ret);
									if (ctr>=250) return false;
									ctr++;
									var str = $(this).html();
									console.error(str);
									if (str.indexOf('<') != -1) return true;
									var start = 0;
									var h = -1;
									var o = {top:-1,left:-1};
									var w = -1;
									var n1,n2;
									n1 = "<span id='test_overflow1'>"+str.slice(0,1)+"</span>"+str.slice(1,str.length);
									n2 = "<span id='test_overflow1'>"+str+"</span>";
									$(this).html(n1);
									var r = document.getElementById('test_overflow1').getBoundingClientRect();
									var h1 = r.bottom-r.top;
									$(this).html(n2);
									r = document.getElementById('test_overflow1').getBoundingClientRect();
									if (h1 == r.bottom-r.top) {
										ret.push({
											height: r.bottom-r.top,
											width: $('#test_overflow1').width(),
											x: r.left,
											y: r.top,
											bottom: r.bottom,
											top: r.top,
											text: str,
											href: $(this).prop('href')
										});
									} else {
										$(this).html(str);
										return true;
										for (var i = 0; i < str.length; i++) {
											//if (h!=-1&&str[i]!=' ') continue;
											var ns = str.slice(0,start)+"<span id='test_overflow1'>"+str.slice(start,i+1)+"</span>"+str.slice(i+1,str.length);
											$(this).html(ns);
											var $t = $(document.getElementById('test_overflow1'));
											//console.log(document.getMatchedCssRules(document.getElementById('test_overflow1'),''));
											if (h==-1||str[i]==' ') h = $t.height();
											else {
												if (h != $t.height()) {
													//console.log("WHEE");
													ret.push({
														height: h,
														width: w,
														y: o.top,
														x: o.left,
														text: $t.html().slice(0,-1),
														href: $(this).prop('href')
													});
													//console.log(window.getComputedStyle(document.getElementById('test_overflow1')));
													start = i;
													ns = str.slice(0,start)+"<span id='test_overflow1' style=''>"+str.slice(start,i+1)+"</span>"+str.slice(i+1,str.length);
													$(this).html(ns);
													$t = $(document.getElementById('test_overflow1'));
													h = $t.height();
												}
												if (i==str.length-1) {
													o = document.getElementById('test_overflow1').getBoundingClientRect();
													//if(!flag) {console.log(window.getComputedStyle(document.getElementById('test_overflow1')).cssText);flag=true;}
													//console.log(window);
													//console.log("HIIIII");
													ret.push({
														height: h,
														width: $t.width(),
														y: o.top,
														x: o.left,
														text: $t.html(),
														href: $(this).prop('href')
													});
												}
											}
											w = $t.width();
											o = document.getElementById('test_overflow1').getBoundingClientRect();
											/*o.top = $t.offset().top;
											o.left = $t.offset().left;*/
										}
									}
									$(this).html(str);
									//$(this).html("<span style='text-shadow:1px 1px #888888'>"+str+"</span>");
									//console.log(ret);
								});
								//console.log(ret);
								ret = ret.filter(function(elem){
									if (elem.width==0&&elem.height==0&&elem.x==0&&elem.y==0) return false;
									if (elem.width<0||elem.height<0||elem.x<0||elem.y<0) return false;
									return true;
								});
								//console.log(ret);
								return ret;
							},function(err,result){
								console.log("Done with links");
								if(err) {
									console.log(err);
									return;
								}
								var fname = 'img'+Date.now()+'.png';
								page.render('static\\'+fname,function(err){
									if (err) {
										console.log(err);
										return;
									}
									//console.log(b64);
									res.write(JSON.stringify({
										links: result,
										bg: "/static/"+fname
									}));
									res.end();
									ph.exit();
								});
									/*
								for (var i = 0; i < result.length; i++) {
									result[i].img = "static/link"+i.toString()+".png";
								}
								if (fs.existsSync("static\\img.png")) fs.unlinkSync("static\\img.png");
								//fs.unlink("static\\img.png",function(err) {
									if (err) {
										console.log(err);
										return;
									}
									
									page.render("static\\img.png");
									ph.exit();
									while (1) {
										if (fs.existsSync("static\\img.png") && fs.statSync("static\\img.png")["size"]>0) break;
										//console.log("NOTTHERE");
									}
									//result.bg = "/static/img.png";
									var fn = function(){
										gm("static\\img.png").toBuffer(function(err,buffer){
										if (err) {
											console.log(err);
											return;
										}
										if (buffer.length<=0) {
											fn();
											return;
										}
									res.writeHead(200,"OK",{'Content-Type':"application/json"});
									res.write(JSON.stringify({
										links: result,
										bg: buffer.toString('base64')
									}));
									res.end();
									//sliceImages("static\\img.png",result,res);
									//sendBlurImage("static\\img.png",res,result);
									//result.bg = "/static/img.png";
									console.log("DONE");*/
									//});};
									//fn();
							//	});
							});
						},2000);
					});
				});
			});
		});
	});
}

function sliceImages(imgname,result,res) {
	console.log("SLICING");
	function docrop(err,i) {
		if (i>=result.length) {
			return gm(imgname).toBuffer(function(err,buffer){
				res.writeHead(200,"OK",{'Content-Type':"application/json"});	
				res.write(JSON.stringify({
					links: result,
					bg: buffer.toString('base64')
				}));
				res.end();
				console.log("DONE");
				return;
			});
		}
		if (err) {
			console.log(err);
			docrop(null,i);
			return;
		}
		var fn = function(j){
			return function(err,buffer) {
				if (err) {
					console.log(err);
					return;
				}
				if (buffer.length<=0) {
					gm(imgname).crop(result[i].width,result[i].height,result[i].x,result[i].y).toBuffer(fn(j));
					return;
				}
				console.log("DONE "+(j-1));
				result[j-1].img = buffer.toString('base64');
				docrop(err,j);
			}
		};
		gm(imgname).crop(result[i].width,result[i].height,result[i].x,result[i].y).toBuffer(fn(i+1));
	}
	docrop(null,0);
	/*
	for (var i = 0; i < result.length; i++) {
		gm(imgname).crop(result[i].width,result[i].height,result[i].x,result[i].y).write("static\\link"+i.toString()+".png",function(err){
			if (err) console.log(err);
			else console.log("Done image "+i.toString());
		});
	}*/
}

function sendBlurImage(imgname,res,result) {
	//res.writeHead(200,"OK",{'Content-Type':"image/png"});
	//console.log(__dirname+'\\'+imgname);
	gm(imgname).modulate(128).write('out.png',function(err){
		if (err) {
			console.log(err);
			return;
		}
		gm(imgname).size(function(err,size){
			var mask = gm(size.width,size.height,'#000000');
			mask.fill('#ffffff');
			for (var i = 0; i < result.length; i++) {
				var dat = result[i];
				mask.drawRectangle(dat.x,dat.y,dat.x+dat.width,dat.y+dat.height);
			}
			mask.write("mask.png",function(){
				gm(imgname).mask("mask.png").modulate(100).write("masked.png",logDone);
			});
		});
	});
	//res.end();
}
function logDone(){console.log("DONE");}

/*
function writeImg(outfile,fn){
	return function(err,stdout,stderr){
		var ws = fs.createWriteStream(outfile);
		var t= [];
		stdout.on('data',function(data){t.push(data);});
		stdout.on('close',function(){
			var img = Buffer.concat(t);
			ws.write(img.toString('base64'),'base64');
			ws.end();
			fn();
		});
	}
};*/