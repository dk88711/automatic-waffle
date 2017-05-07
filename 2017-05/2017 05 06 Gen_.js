//DOM ==========================
var selected_text_layer = null;
var removed_text_layer = [];

function cn(){ //fires changes /**/
	console.log(123)
	drawCanvas(preview, global_cfg);
	preview_img.src = preview.toDataURL();
}

var template_text_layer = texts.children[0].cloneNode(true);

addEventListener("load", function(){ /**/
	init_text_layer(texts.children[0], global_cfg.texts[0]);
	linkProperty(global_cfg.options.bg_img, "color", bg_color);
	linkProperty(global_cfg.options.bg_img, "checked", "bg_img");
	
	//linkGlobalProperty("options.bg_img.url", bg_url);
	
	assignPositionPicker(preview);
	
	cn();
});
function init_text_layer(text_layer, text_cfg){ /**/
	init_color_pickers();
	textLayerDisabledStatus(text_layer,true);
	var unactivated = true;
	text_layer.addEventListener("input",function(){
		if(unactivated){
			unactivated = false;
			textLayerDisabledStatus(text_layer,false);
			
			text_layer.classList.remove("text_layer-unactivated");
			text_cfg.unactivated = false;
			
			create_new_unactivated_text_layer();
		}
	});
	function fn_select_this(){
		if(unactivated) return;
		if(selected_text_layer){
			selected_text_layer.classList.remove("selected");
		}
		selected_text_layer = this;
		this.classList.add("selected");
	}
	text_layer.addEventListener("click", fn_select_this);
	text_layer.addEventListener("input", fn_select_this);
	text_layer.text_cfg = text_cfg;
	text_layer.isRemoved = false;
	var previousElementSibling;
	text_layer.delete = function(){/**/
		previousElementSibling = text_layer.previousElementSibling;
		text_layer.parentNode.removeChild(text_layer);
		global_cfg.texts.splice(global_cfg.texts.indexOf(text_cfg),1);
		text_layer.isRemoved = true;
		removed_text_layer.unshift(text_layer);
		updateUndoText();
		cn();
	};
	text_layer.undelete = function(){
		if(previousElementSibling && !previousElementSibling.isRemoved){
			insertAfter(text_layer, previousElementSibling);
		} else {
			texts.insertBefore(text_layer, texts.firstChild);
		}
		var index = getElIndex(text_layer);
		global_cfg.texts.splice(index ,0,text_cfg);
		text_layer.isRemoved = false;
		removed_text_layer.shift();
		updateUndoText();
		cn();
	}
	function getElIndex(el) {
		for (var i = 0; el = el.previousElementSibling; i++);
		return i;
	}
	/**/
	linkPropByClassName("text", "text");
	linkPropByClassName("color", "text_color");
	linkPropByClassName("size", "fn_size");
	linkPropByClassName("font", "fn");
	linkPropByClassName("delta_line_height", "line_height");
	function linkPropByClassName(property_name, className){
		linkProperty(text_cfg, property_name,
			getClass(className));
	};
	linkProperty(text_cfg.upload, "checked", "upload_font", text_layer);
	linkProperty(text_cfg, "align", "align", text_layer);
	linkProperty(text_cfg, "baseline", "baseline", text_layer);
	linkProperty(text_cfg.pos, "0", getClass("posx"));
	linkProperty(text_cfg.pos, "1", getClass("posy"));
	function getClass(className){
		return text_layer.getElementsByClassName(className)[0];
	}
	getClass("fn_file").onchange = getChangeHandler(
		getClass("fn_file"),
		function(t){
			if(t.files.length){
				text_cfg.upload.file = t.files[0];
				return true;
			} else {
				return false;
			}
		}, function(t, handler){
			FontResourceLoader(t.files[0], handler);
		}, function(font_name,span){
			if(font_name == null){
				return false;
			} else {
				text_cfg.upload.file_fname = font_name;
				span.style.fontFamily = font_name;
				cn();
				return true;
			}
		});
	getClass("fn_url").onchange = getChangeHandler(
		getClass("fn_url"),
		function(t){
			text_cfg.upload.file = t.value;
			return true;
		}, function(t, handler){
			FontResourceLoader(t.value, handler);
		}, function(font_name,span){
			if(font_name == null){
				return false;
			} else {
				text_cfg.upload.url_fname = font_name;
				span.style.fontFamily = font_name;
				cn();
				return true;
			}
		});
	
	//btns
	getClass("btn-remove").addEventListener("click",function(){
		text_layer.delete();
	});
	getClass("btn-up").addEventListener("click",function(){
		text_layer.delete();
		previousElementSibling = previousElementSibling && 
			previousElementSibling.previousElementSibling;
		text_layer.undelete();
	});
	getClass("btn-down").addEventListener("click",function(){
		var a = text_layer.nextElementSibling;
		if(a.text_cfg.unactivated) return;
		text_layer.delete();
		previousElementSibling = a;
		text_layer.undelete();
	});
	//===
	text_layer.setXY = function(x,y){
		getClass("posx").value = x;
		getClass("posy").value = y;
	}
}

function init_elements_form_cfg(cfg){ /**/
	
}

function unremove(){
	if(removed_text_layer.length){
		removed_text_layer[0].undelete();
	}
}

function updateUndoText(){
	removed_count.innerHTML = removed_text_layer.length;
	if(removed_text_layer.length){
		undo_text.classList.remove("hidden");
	}else{
		undo_text.classList.add("hidden");
	}
}

function assignPositionPicker(canvas){
	var keydown = false;
	canvas.addEventListener("mousedown", function(e){
		keydown=true;
		setTextXY(e, canvas);
		cn();
	});
	var fn_1 = function(){keydown=false;};
	addEventListener("mouseleave",fn_1);
	addEventListener("mouseup",fn_1);
	addEventListener("mousemove", function(e){
		if(!keydown) return;
		setTextXY(e, canvas);
		cn();
	});
	
}

function setTextXY(event, target){
	if(!selected_text_layer) return;
	var e = event;
	var X = e.pageX - getOffset(target, "offsetLeft");
	var Y = e.pageY - getOffset(target, "offsetTop");
	selected_text_layer.text_cfg.pos[0] = X;
	selected_text_layer.text_cfg.pos[1] = Y;
	selected_text_layer.setXY(X, Y);
	
	function getOffset(target, property){
		var n = target[property];
		while(target = target.offsetParent){
			n += target[property];
		}
		return n;
	}
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
}
function insertAfter(newNode, referenceNode) {
	if(referenceNode.nextSibling){
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	} else {
		referenceNode.parentNode.appendChild(newNode);
	}
}
 /**/
function getChangeHandler(target,beforeLoad,doLoad,handleImgElement){
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
					var isSuccess = handleImgElement(img_element,span);
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

};
(function(){
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
		cn();
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
		cn();
		return true;
	}
});
})();


//UI ==========

  //TODO get installed font
  
  // <span class="color-picker" data-value="#222222"></span>
  //  inner => 
  //  #<input placeholder="222222"> <input type="color" value="#222222">
  //  color-picker-unset => color-picker
init_color_pickers();
function init_color_pickers(){
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
			params: [0, 0],
			checked:"color", //color,url,file
		},
	},
	texts:[{
		unactivated: true,
		text:"",
		color:"#99ff00",
		size:21,
		font:"",
		upload:{
			file: null,
			file_data: null,
			file_fname: "",
			url:"",
			url_data: null,
			url_fname: "",
			checked:"cancel", //file,url,cancel
		},
		align: "left",
		baseline: "top",
		delta_line_height: 0,
		pos:[0,0]
	}]
	
}

var global_cfg = initCfg();

var datas = {
	img_url: null,
	img_file: null,
	texts:[]
}

var web_fonts = {
	
} // url: {name:"", data: ""}

var template_text_cfg = JSON.parse(JSON.stringify(DEFAULT_CFG.texts[0]));

function initCfg(){ /**/
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

function parseCfg(cfg){ /**/
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

function FontResourceLoader(res, callback){ /**/
	//AS ImageResourceLoader
	//callback(font_name, data)
	
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
	var f_name = "font_"+Math.random().toString(36).slice(2);
	if(typeof res == "string"){
		if(web_fonts[res]){ //check if already loaded
			f_name = web_fonts[res];
			callback(f_name);
			return f_name;
		} else {
			//TODO f_name = ...
			web_fonts[res] = f_name;
		}
	} else if (res instanceof File){
		res = URL.createObjectURL(res);
	}
	var rule = "\
	@font-face {\
    font-family: \""+f_name+"\";\
    src: url("+res+");\
    font-weight: normal;\
    font-style: normal;\
	}"; //unicode-range: U+0000-FFFF;
	document.styleSheets[0].insertRule(rule,0);
	
	callback(f_name);
	return f_name;
}

function linkProperty(obj, property_name, DOM_ele, referenceNode, handler){ /**/
	//DOM_ele can be name, as radio
	//referenceNode is used when DOM_ele is name
	var fn;
	var getValue;
	var nodeList;
	if(handler == null){
		fn = function(e){
			var value = getValue();
			obj[property_name] = 
			  parseFloat(value)==value?
			  parseFloat(value) : value;
		}
		
	} else {
		fn = function(e){
			handler.call(DOM_ele, e);
		}
		
	}
	
	if(typeof DOM_ele == "string"){
		nodeList = (referenceNode||document)
			.querySelectorAll("input[name="+DOM_ele+"]");
		getValue = function(){
			return (referenceNode||document)
				.querySelector("input[name="+DOM_ele+"]:checked")
				.value;
		}
		for(var i = 0; i < nodeList.length; i++){
			nodeList[i].addEventListener("change", fn);
		}
	} else {
		getValue = function(){
			return DOM_ele.value;
		}
		DOM_ele.addEventListener("input", fn);
	}
}
/*
function linkGlobalProperty(p_name, DOM_ele, handler){ /*
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
	
}*/

function createNewTextCfg(){
	var new_cfg = JSON.parse(JSON.stringify(template_text_cfg));
	global_cfg.texts.push(new_cfg);
	return new_cfg;
}

function drawCanvas(canvas, cfg){ /**/
	var ctx = canvas.getContext("2d");
	var w = canvas.width;
	var h = canvas.height;
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	//BG IMG =====
	
	var bg_img = cfg.options.bg_img;
	ctx.save();
	switch(bg_img.checked){
		case "color":
			ctx.fillStyle = bg_img.color;
			ctx.fillRect(0,0,canvas.width,canvas.height);
			break;
		case "url":
			ctx.drawImage.apply(ctx, 
				[datas.img_url].concat(bg_img.params));
			break;
		case "file":
			ctx.drawImage.apply(ctx, 
				[datas.img_file].concat(bg_img.params));
			break;
	}
	
	
	//TEXTs ====
	for(var i = 0; i < cfg.texts.length; i++){
		text(cfg.texts[i]);
	}
	
	function text(attr){
		if(attr.unactivated){
			return;
		}
		ctx.textAlign = attr.align;
		ctx.textBaseline = attr.baseline;
		var fontName = attr.upload.checked=="cancel"?attr.font:
			(attr.upload.checked=="file"?attr.upload.file_fname:
			(attr.upload.checked=="url"?attr.upload.url_fname:""));
		drawString(ctx, attr.text + "", attr.pos[0], attr.pos[1],
			attr.color, 0, fontName, attr.size, attr.delta_line_height);
		//TODO property type
	}
	
	ctx.restore();
	
	
}

/*https://gist.github.com/chriskoch/366054*/
function drawString(ctx, text, posX, posY, textColor, rotation, font, fontSize, lineHeight) {
	var lines = text.split("\n");
	if (!rotation) rotation = 0;
	if (!font) font = "'serif'";
	if (!fontSize) fontSize = 16;
	if (!textColor) textColor = '#000000';
	if (!lineHeight) lineHeight = 0;
	ctx.save();
	ctx.font = fontSize + "px " + font;
	ctx.fillStyle = textColor;
	ctx.translate(posX, posY);
	ctx.rotate(rotation * Math.PI / 180);
	for (i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i],0, i*(fontSize+lineHeight));
	}
	ctx.restore();
}


