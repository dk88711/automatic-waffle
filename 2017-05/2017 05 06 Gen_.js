//DOM ==========================

function cn(){
	console.log(123)
}

var template_text_layer = texts.children[0].cloneNode(true);

init_text_layer(texts.children[0]/*, global_cfg.texts[0]*/);
function init_text_layer(text_layer, text_cfg){
	init_color_picker();
	textLayerDisabledStatus(text_layer,true);
	var unactivated = true;
	text_layer.addEventListener("input",function(){
		if(unactivated){
			unactivated = false;
			textLayerDisabledStatus(text_layer,false);
			
			text_layer.classList.remove("text_layer-unactivated");
			
			create_new_unactivated_text_layer();
		}
	});
	/**/
}

function create_new_unactivated_text_layer(){
	var text_layer = template_text_layer.cloneNode(true);
	texts.appendChild(text_layer);
	init_text_layer(text_layer, createNewTextCfg());
}

function textLayerDisabledStatus(ele, disabled){
	var list = ele.querySelectorAll("input, button");
	for(var i = 0; i < list.length; i++){
		list[i].disabled = disabled;
	}
}

function createLoadStatusIndicator(afterElement){
	var span = document.createElement("span");
	insertAfter(span,afterElement);
	insertAfter(document.createTextNode(" "),afterElement);
	span.fn_empty = function(){t("","")};
	span.fn_loading = function(){t("loading...","yellow")};
	span.fn_loaded = function(){t("Loaded","#99ff00")};
	span.fn_fail = function(){t("Fail","red")};
	function t(status,bg_color){
		span.innerHTML = status;
		span.style.backgroundColor = bg_color;
	}
	return span;
	
	function insertAfter(newNode, referenceNode) {
		if(referenceNode.nextSibling){
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		} else {
			referenceNode.parentNode.appendChild(newNode);
		}
	}
}

(function(){
var getChangeHandler = (
function(target,beforeLoad,doLoad,handleImgElement){
	var span = createLoadStatusIndicator(target);
	
	var isLoading = false;
	var currentHandlerStopper = null;
	
	var fn = function(e){
		if(!beforeLoad(this,e)){
			return;
		};
		if(isLoading){
			currentHandlerStopper();
		}
		var handlerSet = getNewHandler();
		isLoading = true;
		span.fn_loading();
		currentHandlerStopper = handlerSet.stopper;
		doLoad(this, handlerSet.handler);
	}
	
	function getNewHandler(){
		var isInterrupted = false;
		
		return {
			stopper: function(){ isInterrupted = true;},
			handler: function(img_element){
				if(!isInterrupted){
					var isSuccess = handleImgElement(img_element);
					if(isSuccess){
						span.fn_loaded();
					} else {
						span.fn_fail();
					}
					isLoading = false;
					currentHandlerStopper = null;
				}
			}
		};
	}
	
	return fn;

});

bg_url.onchange = getChangeHandler(bg_url,function(t){
	var url = t.value;
	global_cfg.options.bg_img.url = url;
	return true;
},function(t, handler){
	ImageResourceLoader(t.value, handler);
},function(img_element){
	if(img_element == null){
		return false;
	} else {
		datas.img_url = img_element;
		return true;
	}
});
bg_file.onchange = getChangeHandler(bg_file,function(t){
	if(t.files.length){
		global_cfg.options.bg_img.file = t.files[0];
		return true;
	} else {
		return false;
	}
},function(t, handler){
	ImageResourceLoader(t.files[0], handler);
},function(img_element){
	if(img_element == null){
		return false;
	} else {
		datas.img_file = img_element;
		return true;
	}
});
})();

linkGlobalProperty("options.bg_img.color", bg_color);
linkGlobalProperty("options.bg_img.url", bg_url);

//UI ==========

  //TODO get installed font
  
  // <span class="color-picker" data-value="#222222"></span>
  //  inner => 
  //  #<input placeholder="222222"> <input type="color" value="#222222">
  //  color-picker-unset => color-picker
init_color_picker();
function init_color_picker(){
	var pickers = document.querySelectorAll("span.color-picker-unset");
	/**/
	for(var i = 0; i < pickers.length; i++){
		handle(pickers[i]);
	}
	
	function handle(span){
		var val = span.dataset.value || "#000000";
		var lastValidString = "#000000";
		span.innerHTML = 
			 "#<input> "
			+"<input type=\"color\">";
		var text_input = span.children[0];
		var color_input = span.children[1];
		
		function formalTextValue(val){
			val = val.toUpperCase();
			return val.startsWith("#") ? val : "#" + val;
		}
		
		function setSpanValue(val){ //#xxxxxx
			span.value = val;
			span.dataset.value = val;
		}
		
		function isValidColorString(str){ //#xxxxxx
			return /^#[0-9A-F]{6}$/i.test(str);
		}
		
		function fn_ensure(colorString){
			if(typeof colorString == "string"){
				lastValidString = 
					isValidColorString(colorString) ?
					colorString : lastValidString;
			}
			
			setSpanValue(lastValidString);
			color_input.value = lastValidString;
			text_input.value = "";
			text_input.placeholder = lastValidString.slice(1);
		}
		// DOM Event ======
		text_input.oninput = function(e){
			var v = formalTextValue(e.target.value);
			setSpanValue(v);
			color_input.value = isValidColorString(v) ? v : "#000000";
			
			lastValidString = 
				isValidColorString(v) ? v : lastValidString;
		}
		text_input.onchange = fn_ensure;
		
		color_input.onchange = function(e){
			fn_ensure(formalTextValue(e.target.value));
		}
		
		fn_ensure(val);
		
		span.classList.remove("color-picker-unset");
		span.classList.add("color-picker");
		
	}
};

//CORE =========================
var DEFAULT_CFG = {
	options:{
		bg_img:{
			color:"#222222",
			url:"",
			file: null, //File type
			checked:"color", //color,url,file
		},
	},
	texts:[{
		text:"",
		color:"#99ff00",
		size:21,
		font:"",
		upload:{
			file: null,
			file_data: null,
			url:"",
			url_data: null,
			checked:"cancel", //file,url,cancel
		},
		pos:[0,0]
	}]
	
}

var global_cfg = initCfg();

var datas = {
	img_url: null,
	img_file: null,
	texts:[]
}

var template_text_cfg = DEFAULT_CFG.texts[0];

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
	// return: isSuccessfully
	
	var img = new Image();
	var fn_load = function(){
		callback(img);
	}
	var fn_error = function(){
		callback(null);
	}
	img.onload = fn_load;
	img.onerror = fn_error;
	if(typeof res == "string"){
		img.src = res;
		return true;
	} else if (res instanceof File){
		//using blob
		//res = _input_.files[0]
		img.src = URL.createObjectURL(res);
		return true;
		// TODO: URL.revokeObjectURL()
	}
}

function FontResourceLoader(res, callback){
	//AS ImageResourceLoader
	//callback font name
	
	//http://programminglist.blogspot.hk/2013/10/waiting-on-font-load-for-html5-canvas.html
	//http://stackoverflow.com/questions/34922932/javascript-create-font-from-blob-data
	
	/*
	@font-face {
    font-family: "Yo Font";
    src: url(data:application/x-font-woff;charset=utf-8;base64,d09GRgABAA...) format("woff");
    font-weight: normal;
    font-style: normal;
}
*/
	if(typeof res == "string"){
	} else if (res instanceof File){
		res = URL.createObjectURL(res);
	}
	var f_name = "font_"+Math.random().toString(36).slice(2);
	var rule = "\
	@font-face {\
    font-family: \""+f_name+"\";\
    src: url("+res+");\
    font-weight: normal;\
    font-style: normal;\
	";
	document.styleSheets[0].insertRule(rule,0);
	
	//callback(f_name);
	return f_name;
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

function createNewTextCfg(){
	var new_cfg = JSON.parse(JSON.stringify(template_text_cfg));
	global_cfg.texts.push(new_cfg);
	return new_cfg;
}

function setImg(raw, data){
	if(typeof raw == "string"){
		
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


