(function(anigif_base_url){
	window["anigif_base_url"]=anigif_base_url;
	var scr=document.createElement("script");
	scr.src=anigif_base_url+"anigif.min.js";
	document.head.appendChild(scr);
})("https://s3-us-west-2.amazonaws.com/anigif100/anigif/");