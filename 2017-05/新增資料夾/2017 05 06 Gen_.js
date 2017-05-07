//DOM ==========================

function cn(){
	console.log(123)
}


// ==========



//CORE =========================
var DEFAULT_CFG = {
	options:{
		bg_img:{
			color:"222222",
			url:"",
			checked:"color", //color,url,file
		},
	},
	texts:[{
		text:"",
		color:"99ff00",
		size:21,
		font:"",
		upload:{
			url:"",
			checked:"cancel", //file,url,cancel
		},
		pos:[0,0]
	}]
	
}

var global_cfg = initCfg();

function initCfg(){
	try {
		localStorage.getItem("last_cfg");
		/**/
	} catch(e){
		console.log(e);
		
	}
	/**/
	
	
	parseCfg(DEFAULT_CFG);
	return DEFAULT_CFG;
}

function parseCfg(cfg){
	/**/
}

function ImageResourceLoader(res, callback){
	//callback(loaded_img_element), = null when fail
	//res can be url string or file
	
	
}

function linkGlobalProperty(p_name, DOM_ele, handler){
	//handler(cfg,e){this...;}
	//for onchange

	var fn;
	if(handler == null){
		fn = function(e){
			setVal(DOM_ele.value);
		}
		
	} else {
		fn = function(e){
			handler.call(DOM_ele, global_cfg, e);
		}
		
	}
	DOM_ele.addEventListener("input", fn);
	
	function setVal(raw_val){
		var v;
		if(typeof val() == "number"){
			v = parseFloat(raw_val);
		} else {
			v = raw_val;
		}
		val(v);
	}
	
	function val(v){
		return index(global_cfg, p_name, v);
	}
	
	function index(obj,is, value) {
    if (typeof is == 'string')
        return index(obj,is.split('.'), value);
    else if (is.length==1 && value!==undefined)
        return obj[is[0]] = value;
    else if (is.length==0)
        return obj;
    else
        return index(obj[is[0]],is.slice(1), value);
}
	
}

function drawCanvas(canvas, cfg){
	var ctx = canvas.getContext("2d");
	var w = canvas.width;
	var h = canvas.height;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	//BG IMG =====
	
	ctx.save();
	switch(cfg.bg_img.checked){
		case "color":
			ctx.fillStyle = "#222";
			ctx.fillRect(0,0,canvas.width,canvas.height);
			break;
		case "url":
			
		case "file":
	}
	ctx.restore();
	
	//TEXTs ====
	for(var i = 0; i < cfg.texts; i++){
		text(cfg.texts[i]);
	}
	
	function text(attr){
		 
	}
	
	
	
	
}

function drawString(ctx, text, posX, posY, textColor, rotation, font, fontSize) {
	var lines = text.split("\n");
	if (!rotation) rotation = 0;
	if (!font) font = "'serif'";
	if (!fontSize) fontSize = 16;
	if (!textColor) textColor = '#000000';
	ctx.save();
	ctx.font = fontSize + "px " + font;
	ctx.fillStyle = textColor;
	ctx.translate(posX, posY);
	ctx.rotate(rotation * Math.PI / 180);
	for (i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i],0, i*fontSize);
	}
	ctx.restore();
}


