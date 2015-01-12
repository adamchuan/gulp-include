'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var pp = require('preprocess');
var fs = require('fs');
module.exports = function(options) {
	return through.obj(function(file, enc, cb) {

		// Èç¹ûÎÄ¼þÎª¿Õ£¬²»×öÈÎºÎ²Ù×÷£¬×ªÈëÏÂÒ»¸ö²Ù×÷£¬¼´ÏÂÒ»¸ö .pipe()
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}

		var content = pp.preprocess(file.contents.toString(), options || {});
		
		//var baseUrl = options.basePath;
		file.contents = new Buffer(content);
		var reg = /<\!--#include\s+virtual\s*=\s*['"]([^'"]*)['"]\s*-->/ig ;
		// var matches = reg.exec(content);
		//((['"](?<src>[^'"]*)[\'"])|(?<src>[^\s]*))
		var result;
		var fileData = [];
		function entityFile(filePath,lastIndex,length){
			return {
				 filePath : filePath,
				 startIndex : lastIndex - length ,
				 lastIndex : lastIndex,
				 length : length 
			}
		}
		while((result = reg.exec(content)) != null){
			//console.log(result[1]);
			//console.log(RegExp.$1)
			fileData.push(entityFile(result[1],reg.lastIndex,result[0].length));
		}
		var contentTemp = [],
		    startPosition = 0;
		/* 把文章分割开 */
		fileData.forEach(function(file,i){
			contentTemp.push(content.substring(startPosition,file.startIndex - 1));
			contentTemp.push(readFile(file.filePath));
			startPosition = file.lastIndex + 1;
		});
		contentTemp.push(content.substring(startPosition,content.length));//把最后一段加上

		var newContent = contentTemp.join('');

		function readFile(filePath){
			var filePath = options.baseUrl + filePath;
			try{
				var includeContent = fs.readFileSync(filePath);
			}
			catch(e){
				console.log(filePath + "\n" + "文件地址错误" + e);
				return ;
			}
			// strip utf-8 BOM  https://github.com/joyent/node/issues/1918
			includeContent = includeContent.toString('utf-8').replace(/\uFEFF/, '');

			// need to double each `$` to escape it in the `replace` function
			includeContent = includeContent.replace(/\$/gi, '$$$$');

			return includeContent;
		}
		file.contents = new Buffer(newContent);
		this.push(file);

		cb();
	});
};