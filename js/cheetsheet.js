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


$("#cheetsheet .close").click(function(){
	$("#cheetsheet").addClass("hidden");
});

function showCheetSheet(){
	$("#cheetsheet").removeClass("hidden");
	$("#cheetsheet .close").focus();
}