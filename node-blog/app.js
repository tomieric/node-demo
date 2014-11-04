var express = require('express');
var fs = require('fs');
var marked = require('marked');
var pygmentize = require('pygmentize-bundled');
// var vhost = require('vhost');
var port = process.env.port || 3000;
var app = express();

// # markdown
marked.setOptions({
	highlight: function(code, lang, callback){
		pygmentize({ lang: lang, format: 'html'}, code, function(err, result) {
			callback(err, result.toString())
		})
	}
});

function markdown2html(data, callback){
	marked(data, function(err, content) {
		return callback(err, content)
	})
}

//# middleware
app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname+'/theme/default'));
app.use(function(req, res, next) {
	next();
});
//app.use(vhost('*.mynode.com', app));
// app.use(vhost('mynode.com', app));

// #router
// 首页
app.get('/', function(req, res) {
	var html = '';
	//var blogList = 
	getBlogList('./blogs', function(blogList){
		//console.log(blogList);
		if(blogList && blogList.length) {
			blogList.forEach(function( blog ){
				html+= '<li><a href="'+ blog.url +'">'+ blog.title + '</a></li>'
			})
			html = '<ul>'+ html + '</ul>';
			//res.send(html);
			res.render('index', {
				content: html
			});
		}else{
			res.send('No Blogs Found.');
		}
	});
});

// 详细页
app.get('/blog/:year/:month/:day/:title', function(req, res){
	var fileName = './blogs/' + 
					req.params.year + '-' +
					req.params.month + '-'+
					req.params.day + '-' +
					req.params.title + '.md';
	fs.readFile(fileName, 'utf-8', function(err, data) {
		if(err){
			res.send(err)
		}
		markdown2html(data, function(err, content){
			if(err) res.send(err);
			// res.send(content);
			res.render('article', {
				title: req.params.title,
				content: content
			});
		})
	});
});

// # jade
app.get('/jade', function(req, res){
	res.render('template');
});

// 404
app.get("*", function(req, res){
	res.send(404, "Oops!We didn't find it")
});



// # getBlogList()
function getBlogList(blogDir, callback){
	var blogList = [], blogItem = {};
	var reg = /(\d{4})-(\d{2})-(\d{2})-(.+)\.md/g, result;
	fs.readdir(blogDir, function(err, files) {
		if(files && files.length) {
			files.forEach(function(filename) {
				result = reg.exec(filename);
				if(!!result){
					blogItem = { title: (result[4] || ''), url: '/blog/'+ result[1]+'/'+result[2]+'/'+result[3]+'/'+result[4]};
					blogList.push(blogItem);
				}
			});
		}
		callback.call(null, blogList);
	});
}

app.listen(port);
console.log('server started on port:'+port);