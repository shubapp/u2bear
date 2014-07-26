var pkg = require("./package.json");

var cheetSheet=[
	{key:"Esc", desc:"Stop the current playing video and exit the player (also exit full screen)"},
	{key:"Spacebar", desc:"Pause and resume video"},
	{key:"f", desc:"Toogles in and out of full screen"},
	{key:"?", desc:"Open this cheet sheet"},
	{key:"~", desc:"Open debugger"},
	];

for (var key = 0; key < cheetSheet.length; key++) {
	$("#hotKeys").append("<tr><td>&lt;" + cheetSheet[key].key + "&gt;</td><td>" + cheetSheet[key].desc +"</td>");
};
$("#version").text("U2bear - V" + pkg.version);

$("#cheetsheet .close").click(function(){
	toogleCheetSheet();
});

function toogleCheetSheet(){
	if ($("#cheetsheet").hasClass("hidden")) {
		$("#cheetsheet").removeClass("hidden");
		$("#cheetsheet .close").focus();
	} else{
		$("#cheetsheet").addClass("hidden");
	}
}