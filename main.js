var fs = require('fs');
var ytdl = require('ytdl');
var search = require('youtube-search');
var mp3 = require('youtube-mp3');
var gui = require('nw.gui');
var http = require('http');


var APP_DIRECTORY = "";
if (process.execPath.indexOf("u2bear.exe")!=-1){
	APP_DIRECTORY=process.execPath.replace("u2bear.exe","");
}
var VIDEOS_DIRECTORY = APP_DIRECTORY + "videos/";
var SONGS_DIRECTORY = APP_DIRECTORY +"songs/";
var IMAGES_DIRECTORY = APP_DIRECTORY +"images/";

process.on('uncaughtException',function(err){
	console.log("FATAL ERROR: " +err);
});


var opts = {
  maxResults: 18,
  startIndex: 1
};

var displayedVids=[];
var searchPhrase ="";
var stoppedLoading = true;
var maxIndex=0;
var playerOn=false;
var repeatOn=false;
var searchOptions={
	youtube:1,
	local:2
};
var playerOptions={
	PAUSE_PLAY:1,
	STOP:2,
	PLAY:3
};
var searchSwitch = searchOptions.youtube;
var localVids=[];
var localSongs=[];

var playList=[];
var currentlyDownloading={MAX_DOWNLOADS:3,currentSize:0};
var currListIndex=0;

$(document).ready(function(){
	initGui();
	loadLocalData();
});

function showResaults(results){
	$("#resultContainer").html("");
	maxIndex=0;
	displayedVids = results;
	if (searchSwitch == searchOptions.youtube){
		addYoutubeResults(results);
	}else if(searchSwitch == searchOptions.local){
		addLocalResaults(results);
	}
}

function nextPage(results){
	maxIndex = displayedVids.length;
	displayedVids = displayedVids.concat(results);
	addYoutubeResults(results);
}

function validateVideoName(name){
	name = name.replace(/\\/g,"_");
	name = name.replace(/\//g,"_");
	name = name.replace(/\?/g,"_");
	name = name.replace(/\:/,"_");
	name = name.replace(/\*/g,"_");
	name = name.replace(/\"/g,"_");
	name = name.replace(/\>/g,"_");
	name = name.replace(/\</g,"_");
	name = name.replace(/\|/g,"_");
	return name;
}

function addYoutubeResults(results){
	for (;maxIndex< displayedVids.length ; maxIndex++) {
		results[maxIndex - (displayedVids.length-results.length)].title = validateVideoName(results[maxIndex - (displayedVids.length-results.length)].title);
		var addedElem = $("<span index='"+ maxIndex +"' class='result'><div class='overlay'><i class='fa fa-info-circle'></i>"+
			"<i class='fa fa-headphones'></i><i class='fa fa-film'></i><div class='progressbarContainer' data-width='0%'><div class='progressbarValue'></div></div></div><img src=\"" +
			results[maxIndex - (displayedVids.length-results.length)].thumbnails[0].url +"\" /><div dir='auto' class='vidTitle'>" + 
			results[maxIndex - (displayedVids.length-results.length)].title +"</div></span>");
		
		$("#resultContainer").append(addedElem);

		if($.inArray(results[maxIndex - (displayedVids.length-results.length)].title+'.mp4',localVids)!=-1) {
			$(".result[index=" +maxIndex + "]").find(".fa-film").addClass("success");
		}

		if($.inArray(results[maxIndex - (displayedVids.length-results.length)].title+'.mp3',localSongs)!=-1) {
			$(".result[index=" +maxIndex + "]").find(".fa-headphones").addClass("success");
		}

		if(currentlyDownloading[results[maxIndex - (displayedVids.length-results.length)].title]) {
			$(".result[index=" +maxIndex + "]").find(".fa-film").addClass("downloading");
			$(".result[index=" +maxIndex + "]").addClass("active");
		}
	}

	$(".result").hover(function(){
		$(this).find(".overlay").addClass("active");
	},function(){
		if($(this).find(".downloading").length==0){
			$(this).find(".overlay").removeClass("active");
		}
	});

	// $(".result .fa-film").click(downloadVideo);
	$(".result .fa-headphones").click(downloadMp3);
	$(".result .fa-film").click(enqueYoutubeVideo);

	stoppedLoading = true;
}

function extractName(vidName){
	return vidName.substring(0,vidName.lastIndexOf('.mp4'));
}

function addLocalResaults(results){
	for (;maxIndex< displayedVids.length ; maxIndex++) {
		var addedElem = $("<span index='"+ maxIndex +"' class='result'><div class='overlay'><i class='fa fa-trash-o'></i><i class='fa fa-play'></i><i class='fa fa-plus-square-o'></i></div><img src=\"" + 
			IMAGES_DIRECTORY + results[maxIndex - (displayedVids.length-results.length)] +".jpg\" /><div dir='auto' class='vidTitle'>" + 
			extractName(results[maxIndex - (displayedVids.length-results.length)]) +"</div></span>");
		
		$("#resultContainer").append(addedElem);

	}

	$(".result").hover(function(){
		$(this).find(".overlay").addClass("active");
	},function(){
		$(this).find(".overlay").removeClass("active");
	});
	$(".result .fa-play").click(playLocalVideo);
	$(".result .fa-plus-square-o").click(enqueLocalVideo);
	$(".result .fa-trash-o").click(deleteLocalVideo);

	stoppedLoading = true;
}

function deleteLocalVideo(){
	var resultElem = $(this).parents(".result");
	var chosenVid = {title:displayedVids[resultElem.attr("index")],
			thumbnails:[{url:displayedVids[resultElem.attr("index")] + ".jpg"}]};
	fs.unlink(VIDEOS_DIRECTORY+chosenVid.title);
	fs.unlink(IMAGES_DIRECTORY+chosenVid.thumbnails[0].url);
	displayedVids[resultElem.attr("index")]= null;
	for (var index=0; index<localVids.length;index++){
		if (chosenVid.title == localVids[index]){
			localVids[index]=null;
			break;
		}
	}
	resultElem.remove();
}

function enqueLocalVideo(){
	var resultElem = $(this).parents(".result");
	var chosenVid = {title:extractName(displayedVids[resultElem.attr("index")]),
			thumbnails:[{url:displayedVids[resultElem.attr("index")] + ".jpg"}],
			element:resultElem};
	playList.push(chosenVid);
	playVideos();
}

function playLocalVideo(){
	playList=[];
	currListIndex=0;
	var resultElem = $(this).parents(".result");
	var chosenVid = {title:extractName(displayedVids[resultElem.attr("index")]),
			thumbnails:[{url:displayedVids[resultElem.attr("index")] + ".jpg"}],
			element:resultElem};
	tooglePlayer(playerOptions.STOP);
	playList.push(chosenVid);
	playVideos();
}

function enqueYoutubeVideo(){
	var resultElem = $(this).parents(".result");
	var chosenVid = displayedVids[resultElem.attr("index")];
	chosenVid.element = resultElem;
	playList.push(chosenVid);
	playVideos();
}

function tooglePlayer(option){
	if(option == playerOptions.STOP){
		if(playerOn){
			videojs("player").pause();
			if($("#playerPlay").hasClass("fa-pause")){
				$("#playerPlay").removeClass("fa-pause");
				$("#playerPlay").addClass("fa-play");
			}
			$("#player").removeClass("active");
			playerOn=false;
		}
	}else if(option == playerOptions.PAUSE_PLAY){
		// player not on  OR player in pause
		if(!playerOn || ($("#playerPlay").hasClass("fa-play"))){
			if (!playerOn){
				$("#player").addClass("active");
			}

			videojs("player").play();

			if($("#playerPlay").hasClass("fa-play")){
				$("#playerPlay").removeClass("fa-play");
				$("#playerPlay").addClass("fa-pause");
			}

			playerOn=true;
		} else {
			videojs("player").pause();
			if($("#playerPlay").hasClass("fa-pause")){
				$("#playerPlay").removeClass("fa-pause");
				$("#playerPlay").addClass("fa-play");
			}
		}
	}else if(option == playerOptions.PLAY){
		if (!playerOn){
			$("#player").addClass("active");
		}

		if($("#playerPlay").hasClass("fa-play")){
			$("#playerPlay").removeClass("fa-play");
			$("#playerPlay").addClass("fa-pause");
		}
		
		videojs("player").play();
		playerOn=true;
	}
}

function playVideos(){
	if (currListIndex < playList.length){
		var chosenVid = playList[currListIndex];
		if (playList[currListIndex+1]){
			$("#nextArrow").removeClass("hidden");
			$("#playedNextName").text(playList[currListIndex+1].title);
			$("#playedNextName").removeClass("hidden");
		}else{
			$("#nextArrow").addClass("hidden");
			$("#playedNextName").addClass("hidden");
		}
		if(!playerOn){
			if (fs.existsSync(VIDEOS_DIRECTORY+chosenVid.title+'.mp4') && (!currentlyDownloading[chosenVid.title])) {
				$("#playedName").text(chosenVid.title);
				videojs("player").ready(function(){
					var myPlayer = this;
					myPlayer.src({ type: "video/mp4", src: VIDEOS_DIRECTORY+chosenVid.title+'.mp4' });
					myPlayer.load();
					tooglePlayer(playerOptions.PLAY);
				});
			}
		}

		for(var nextSongs= currListIndex; nextSongs < playList.length; nextSongs++){
			chosenVid = playList[nextSongs];
			if (!fs.existsSync(VIDEOS_DIRECTORY+chosenVid.title+'.mp4')){
					downloadVideoParams(chosenVid, playVideos);
			}
		}
	}
}

function downloadMp3(){
	var resultElem = $(this).parents(".result");
	var chosenVid = displayedVids[resultElem.attr("index")];

	downloadFile(chosenVid.thumbnails[0].url, IMAGES_DIRECTORY +chosenVid.title+'.mp3.jpg');

	mp3.download(chosenVid.url, SONGS_DIRECTORY +chosenVid.title+'.mp3', function(err) {
	    if(err) return console.log(err);
	    resultElem.find(".fa-headphones").addClass("success");
	    localSongs.push(chosenVid.title+'.mp3');
	});
}

function downloadFile(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    //if (cb) cb(err.message);
  });
}

function downloadVideo(){
	var resultElem = $(this).parents(".result");
	var chosenVid = displayedVids[resultElem.attr("index")];
	chosenVid.element = resultElem;
	downloadVideoParams(chosenVid);
}

function downloadVideoParams(chosenVid, cb){
	var resultElem = chosenVid.element;
	resultElem.find(".fa-film").addClass("downloading");
	resultElem.addClass("active");
	if ((currentlyDownloading.currentSize< currentlyDownloading.MAX_DOWNLOADS) && (!currentlyDownloading[chosenVid.title])) {
		downloadFile(chosenVid.thumbnails[0].url, IMAGES_DIRECTORY +chosenVid.title+'.mp4.jpg');
		currentlyDownloading.currentSize++;
		currentlyDownloading[chosenVid.title] = true;
		var downloadVid = ytdl(chosenVid.url,
			{filter: function(format) { return format.container === 'mp4';} , 
			quality:'highest'}
		);


		downloadVid.pipe(fs.createWriteStream(VIDEOS_DIRECTORY+chosenVid.title+'.mp4'));
		downloadVid.on('info',function(info,format){
			this.size = 1 * format.size;
		});
		downloadVid.on('data', function(chunk) {
	  		resultElem.find(".progressbarValue").css("width",Math.round(this._readableState.pipes.bytesWritten / this.size * 100) + "%");
	  		resultElem.find(".progressbarContainer").attr("data-width",Math.round(this._readableState.pipes.bytesWritten / this.size * 100) + "%");
		});
		downloadVid.on('end',function(){
			delete(currentlyDownloading[chosenVid.title]);
			currentlyDownloading.currentSize--;
			resultElem.find(".fa-film").removeClass("downloading");
			resultElem.removeClass("active");
			resultElem.find(".fa-film").addClass("success");
			localVids.push(chosenVid.title+'.mp4');
			if(cb){
				cb();
			}
		});
		downloadVid.on('error',function(){
			delete(currentlyDownloading[chosenVid.title]);
			currentlyDownloading.currentSize--;
			fs.unlink(VIDEOS_DIRECTORY+chosenVid.title+'.mp4');
			resultElem.find(".fa-film").removeClass("downloading");
			resultElem.removeClass("active");
			resultElem.find(".fa-film").addClass("failure");
		});
	}
}

function initGui(){
	var win = gui.Window.get();
    var tray = new gui.Tray({title: 'U2Bear', icon: 'u2bearFlat.png' });
    var menu = new gui.Menu();
	menu.append(new gui.MenuItem({ type: 'normal', label: 'Open',click: function() {
        win.show();
        win.focus();
    }}));
	menu.append(new gui.MenuItem({ type: 'checkbox', label: 'Always on top',click:function(){
		win.setAlwaysOnTop(this.checked);
	}}));
	menu.append(new gui.MenuItem({ type: 'separator'}));
	menu.append(new gui.MenuItem({ type: 'normal', label: 'Close',click: function(){
		win.close();
	}}));
    tray.menu = menu;

	win.on('minimize', function() {
      this.hide();
    });

	tray.on('click', function() {
		win.show();
		win.focus();
	});

    $("#titleClose").click(function(){
    	win.close();
    });

    $("#titleMin").click(function(){
    	win.minimize();
    });

    $("#titleMax").click(function(){
    	win.toggleFullscreen();
	});

	$("#titleDebug").click(function(){
    	win.showDevTools();
	});

	$("#playerStop").click(function(){
		tooglePlayer(playerOptions.STOP);
	});

	$("#playerPlay").click(function(){
		tooglePlayer(playerOptions.PAUSE_PLAY);
	});

	$("#playerBackward").click(function(){
		if (currListIndex>0){
			tooglePlayer(playerOptions.STOP);
			currListIndex--;
			playVideos();
		}
	});

	function nextVideo(){
		if (currListIndex<playList.length){
			tooglePlayer(playerOptions.STOP);
			currListIndex++;
			if((currListIndex==playList.length) && (repeatOn)){
				currListIndex=0;
			}
		}
		playVideos();
	}

	$("#playerForward").click(nextVideo);

	$("#playerRepeat").click(function(){
		if (repeatOn){
			repeatOn=false;
			$("#playerRepeat").removeClass("active");
		}else{
			repeatOn=true;
			$("#playerRepeat").addClass("active");
		}
	});
	

	$("#titleBackground").click(function(){
    	if ($("#titleBackground").hasClass("active")){
    		$("#titleBackground").removeClass("active");
    		$("#player").addClass("background");
    	}else{
    		$("#titleBackground").addClass("active");
    		$("#player").removeClass("background");
    	}
	});

	$(".switches").click(function(){
		$(".switches").removeClass("active");
    	$(this).addClass("active");

    	if ($(this).attr("id")=="youtubeSwitch"){
	    	searchSwitch = searchOptions.youtube;
	    }else if($(this).attr("id")=="localSwitch"){
	    	searchSwitch = searchOptions.local;
	    }
	    $("#search").focus();
	});
	


    videojs("player").on("ended", nextVideo);

    $(document).bind('keydown',function(event){
    	//esc
    	if(event.keyCode==27){
    		if(playerOn){
    			tooglePlayer(playerOptions.STOP);
    		}else if(win.isFullscreen){
    			win.toggleFullscreen();
    		}else{
    			win.close();
    		}
    	//spacebar
    	}else if(event.keyCode==32){
    		if (!$("#search").is(":focus")){
	    		event.preventDefault();
				tooglePlayer(playerOptions.PAUSE_PLAY);
    		}
    	// f for fullscreen
		} else if(event.keyCode==70){
    		if (!$("#search").is(":focus")){
				win.toggleFullscreen();
    		}
		}
    });


    $("#search").bind('keypress',function(event){
		if(event.charCode==13){
			searchPhrase =$(this).val();
			if(searchSwitch==searchOptions.youtube){
				opts.startIndex=1;
				search(searchPhrase, opts, function(err, results) {
				  if(!err) 
				  	showResaults(results);
				});
			}else if(searchSwitch==searchOptions.local){
				var regex=new RegExp(searchPhrase.replace(" ","|"),'i');
				var filteredVids=[];
				for (var localIndex=0; localIndex<localVids.length;localIndex++){
					if ((localVids[localIndex])&&(regex.test(localVids[localIndex]))) {
						filteredVids.push(localVids[localIndex]);
					}
				}
				showResaults(filteredVids);
			}
		}
	});

    $("#resultContainer").scroll(function(){
    	if((searchSwitch == searchOptions.youtube)&&(stoppedLoading)&&($(this)[0].scrollHeight - $(this).scrollTop() <= $(this).outerHeight() + 300)){
    		stoppedLoading = false;
    		opts.startIndex+=opts.maxResults;
    		search(searchPhrase, opts, function(err, results) {
			  if(!err) 
			  	nextPage(results);
			});
    	}
    });

    //for first time searching on load
    //var enterEvent =$.Event("keypress");
    //enterEvent.charCode=13;
    //$("#search").trigger(enterEvent)

	$("#search").focus();
}


function loadLocalData(){
	fs.readdir(VIDEOS_DIRECTORY, function(err,files){
		if(err){
			console.log(err);
			localVids=[];
		}else{
			localVids=files;
		}
	});

	fs.readdir(SONGS_DIRECTORY, function(err,files){
		if(err){
			console.log(err);
			localSongs=[];
		}else{
			localSongs=files;
		}
	});
}