'use strict';
// var UglifyJS = require("uglify-js");
const fs = require('fs');
const CommentStripper = require('./common/commentstripper.js');
let min = 
`/*
Copyright © All rights reserved.
https://kosshi.fi/contact
*/
'use strict'`;

function processFolder(folder){
	fs.readdir(folder, (err, items)=>{
		for (var i = 0; i < items.length; i++) {
			const item = items[i];
			fs.stat(folder + item, (err, stats)=>{
				if(err) throw err;
				if(stats.isDirectory()){
					processFolder(folder+item+'/');
				} else if(stats.isFile())
					found(folder+item);
			});
		}
	});
}

processFolder('./client/');

function found(item){
	let _a = item.split('.');
	if ( _a[_a.length-1] != 'js' )
		return;
	if ( item.search('/worker/') != -1 )
		return;
	console.log('Found: ' + item);
	let src = fs.readFileSync(item);
	src = new CommentStripper().strip(src+"");

	src = src.replace(/'use strict';/, '');
	min += src + '\n';
}



setTimeout( ()=>{

	fs.writeFileSync('./min.js', min );

}, 1000);