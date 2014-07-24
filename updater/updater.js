var updater = require("node-webkit-updater");
var exec = require('child_process').exec;
var execFile = require('child_process').execFile;
var spawn = require('child_process').spawn;
var path = require('path');
var pkg = require("../package.json");
var upd = new updater(pkg);
var webkitWindow;

function update(win){
	webkitWindow = win;
	upd.checkNewVersion(newVersionAvailable);
}

function newVersionAvailable(err, manifest){
	errorHandler(err);
	upd.download(newVersionDownloaded);
}

function newVersionDownloaded(err, filename){
	errorHandler(err);
	upd.unpack(filename,newVersionUnpacked);
}

function newVersionUnpacked(err, newAppPath){
	errorHandler(err);
	
	var SRC_DIRECTORY;

	if (process.execPath.indexOf("u2bear.exe")!=-1){
		SRC_DIRECTORY = path.dirname(process.execPath);
	}else{
		SRC_DIRECTORY = __dirname;
	}

	var updateProcess = spawn(path.resolve(newAppPath,"tools/restartApp.bat"), [SRC_DIRECTORY,newAppPath,"u2bear.exe"],{detached:true,stdio: [ 'ignore', 'ignore', 'ignore' ]});
	updateProcess.unref();
	webkitWindow.close();
}

function errorHandler(err){
	if(err){
		console.log(err);
	}
}

module.exports = update;