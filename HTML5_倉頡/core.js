var char="日月金木水火土竹戈十大中一弓人心手口尸廿山女田難卜Z";

var add_load_res;
var res = {};
var res_onload_all;
(function(){
	//===
	var indicator_ID = "res_indicator";
	//===
	
	var res_list = [];
	var res_map = {};
	var res_count = 0;
	var loaded_count = 0;
	var fail_count = 0;
	var res_indicator = null;
	function add_load_res(url, load_handler, error_handler){
		res_list.push(url);
		res_map[url] = "loading";
		res_count ++;
		ajax_load(url, 
		function(a, b){
			res_map[url] = "loaded";
			res[url] = a;
			loaded_count++;
			update_status();
			load_handler ? load_handler(a, b) : console.log(b);
		}, 
		function(a){
			res_map[url] = "fail";
			fail_count++;
			update_status();
			error_handler ? error_handler(a) : console.warn(a);
		});
		update_status();
	}
	
	function get_status_HTML(){
		var str_ = ["Loading...","All resources loaded.","Fail.",
		  "Please refresh the page and retry."];
		var color = ["yellow", "#9f0", "#d46c57"];
		 // loading, loaded, fail
		/**/
		//===
		var html = "";
		if(fail_count){ //fail
			html += getSpanHTML(str_[2], 2);
		} else if (loaded_count >= res_count){ //loaded
			html += getSpanHTML(str_[1], 1);
			return html;
		} else { //loading
			html += getSpanHTML(str_[0], 0);
		}
		for( var i in res_list){
			br();
			var url = res_list[i];
			html += getSpanHTML(
				res_map[url]=="loading" ? url + " ..." : url,
				["loading","loaded","fail"]
					.indexOf(res_map[url]));
		}
		
		if(fail_count){
			br();
			html += getSpanHTML(str_[3], 2);
		}
		function getSpanHTML(text, index_bgcolor){
			return "<span style=\"background-color:"+
				color[index_bgcolor]
				+";\">" + text + "</span>";
		}
		function br(){
			html += "<br>";
		}
		return html;
	}
	
	var loaded_all = false;
	function update_status(){
		if(res_indicator){
			res_indicator.innerHTML = get_status_HTML();
		}
		do_check_loaded_all();
	}
	
	function do_check_loaded_all(){
		if(loaded_all){
			return;
		}
		if(loaded_count >= res_count){
			loaded_all = true;
			res_onload_all && res_onload_all();
		}
	}
	
	//DOMContentLoaded
	function check_DOM_indicator_exists(){
		if(res_indicator){
			return true;
		}
		res_indicator = document.getElementById(indicator_ID);
		if(res_indicator){
			update_status();
			return true;
		}
		return false;
	}
	
	MutationObserver && new MutationObserver(check_DOM_indicator_exists)
		.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
	addEventListener("DOMContentLoaded", check_DOM_indicator_exists);
	
	window.add_load_res = add_load_res;
})();

//Add resource=====
add_load_res("cangjie.txt", function(t){
	var a = t.split(/\r?\n/g).forEach(function(e){
		var b = e.split("\t");
		if(b[0] in cangjie_char){
			cangjie_char[b[0]].push(b[1]);
		} else {
			cangjie_char[b[0]] = [b[1]];
		}
		
		if(b[1] in cangjie_key){
			cangjie_key[b[1]].push(b[0]);
		} else {
			cangjie_key[b[1]] = [b[0]];
		}
	});
});
add_load_res("changjie1.json", function(t){
	changjie1 = JSON.parse(t);
});
add_load_res("changjie2a.json", function(t){
	changjie2a = JSON.parse(t);
});
add_load_res("charlist.txt");
add_load_res("charlist_5000.txt");

var changjie1;
var changjie2a;
var cangjie_char = {}; //get key from char
var cangjie_key = {};  //get cahr from list

var using_charmap = null;
res_onload_all = function(){
	/**/
	//====
	// For 練習,
	// charlist.txt or charlist_5000.txt
	
	// main = cangjie_char
	
	//====
	using_charmap = changjie2a;
}

var id_main = [
	"main-char",     //  0
	"main-desc",     //  1
	"main-score",    //  2 
	"main-ur-key",   //  3
	"main-ur-ch",    //  4
	"main-hint-key", //  5
	"main-hint-ch",  //  6
];
var div_main;

function active_empty(){
	for(var i in div_main){
		div_main[i].innerHTML = "";
	}
}

function active(genNext){
	//call genNext, return str or str[..]
	document.activeElement.blur();
	active_empty();
	var score = 0;
	function updateScore(){
		div_main[2].innerHTML = score;
	}
	function correct(){
		score += 100;
		updateScore();
	}
	function wrong(){
		score -= 50;
		updateScore();
	}
	var targetKey = null; //keycode, lowercase
	function showKey(keycode, ele_key, ele_ch){ //lowercase
		var arr_key = [];
		var arr_ch = [];
		
		function key(keycode){
			var charcode = String.fromCharCode(keycode)
				.toLowerCase().charCodeAt();
			if(charcode < 97 || charcode > 122){
				return;
			}
			arr_key.push(String.fromCharCode(keycode));
			arr_ch.push(char[charcode - 97]);
		}
		if(Array.isArray(keycode)){
			keycode.forEach(key);
		} else {
			key(keycode);
		}
		
		
		ele_key.innerHTML = arr_key.join("<br>");
		ele_ch.innerHTML = arr_ch.join("<br>");
	}
	function isInTarget(charcode){
		if(Array.isArray(targetKey)){
			return targetKey.indexOf(charcode) != -1;
		} else {
			return targetKey == charcode;
		}
	}
	keyHook(function(e){
		var isCorrect;
		var charcode = String.fromCharCode(e.keyCode)
			.toLowerCase().charCodeAt();
		if(targetKey && isInTarget(charcode)/*charcode == targetKey*/){
			isCorrect = true;
			correct();
			showKey("", div_main[5], div_main[6]);
			targetKey = genNext(e.keyCode);
		} else {
			isCorrect = false;
			wrong();
			showKey(targetKey, div_main[5], div_main[6]);
		};
		showKey(e.keyCode, div_main[3], div_main[4]);
	});
	targetKey = genNext(null);
}

function active1(){

	var list="日月金木水火土竹戈十大中一弓人心手口尸廿山女田卜";
	var this_str = null;
	var i = 0;
	function getNext(){
		/*not include 難*/
		if(this_str == null || i >= this_str.length){ //get new random str
			var new_str;
			while(
				(new_str = shuffle(list)).charAt(0) == 
				(this_str && this_str.charAt(i-1)) ){};
			i = 0;
			this_str = new_str;
		}
		var target_char = this_str[i];
		i ++;
		//while (target_char = list
		//	.charAt(Math.floor(Math.random() * list.length)))
		div_main[0].innerHTML = target_char;
		return 97 /*a charCode*/ + char.indexOf(target_char);
	}
	active(getNext);
	
	function shuffle (str) {
		var a = str.split(""),
			n = a.length;

		for(var i = n - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var tmp = a[i];
			a[i] = a[j];
			a[j] = tmp;
		}
		return a.join("");
	}
}

function active2(){
	active_empty();
	
	var this_char = null;
	var last_char = null;
	function getRanChar(){
		//add_load_res("charlist.txt");
		//add_load_res("charlist_5000.txt");
		// res[""]
		var str = res["charlist_5000.txt"];
		return str
			.charAt(Math.floor(
			Math.random() * str.length));
	}
	function getNextChar(){
		last_char = this_char;
		while( (this_char = getRanChar()) == last_char ){};
		return this_char;
	}
	
	active2_extra(getNextChar);
}

function active2_extra(getNextChar){ //func should avoid repeat issue
	active_empty();
	
	var this_char = null;
	var this_keys = null; //str
	var last_char = null;
	
	/** old
	var i = 0;
	function getNext(){
		i++;
		if(this_char == null || i >= this_keys.length){
			last_char = this_char;
			(this_char = getNextChar());
			// get_corr_keys ===
			this_keys = cangjie_char[this_char][0] + " ";
			div_main[0].innerHTML = this_char;
			i = 0;
		}
		div_main[1].innerHTML = i+1 == this_keys.length ?
			"請按空白棒" :
			"請鍵入第"+(i+1)+"碼";
		return this_keys.charCodeAt(i);
	}*/
	
	//arr to obj process:
	// eg ["abce","abde"] =>
	//    {a:{b:{c:{e:{" ":null}},d:{e:{" ":null}}}}}
	function arr_to_obj(arr){
		if(!arr){
			return null;
		}
		
		var o = {}; //"abcd" => a:[bcd] then convert 
		arr.forEach(function(e){
			if(e.length == 0){
				o[" "] = null;
				return;
			}
			var key = e.charAt(0);
			if(key in o){
				o[key].push(e.slice(1));
			} else {
				o[key] = [e.slice(1)];
			}
		});
		for(var k in o){
			if(o[k]){
				o[k] = arr_to_obj(o[k]);
			}
		}
		
		return o;
	}
	//MAIN==
	var i = 0;
	function getNext(lastKeyCode){
		if(lastKeyCode) {
			var last_char = null;
			lastKeyCode && (
				last_char = String.fromCharCode(lastKeyCode)
				.toLowerCase());
			this_keys = this_keys[last_char];
			i++;
		}
		if(this_keys == null){
			this_char = getNextChar();
			this_keys = arr_to_obj(using_charmap[this_char]); //DATA
			div_main[0].innerHTML = this_char;
			i = 0;
		}
		
		
		innerHTML = [];
		var keys = Object.keys(this_keys);
		if (!(keys.length == 1 && keys[0] == " ")) {
			innerHTML.push("請鍵入第"+(i+1)+"碼");
		}
		if ( keys.indexOf(" ") != -1){
			innerHTML.push("請按空白棒");
		}
		
		div_main[1].innerHTML = innerHTML.join("<br>");
		return keys.map(function(e){return e.charCodeAt()});
	}
	
	active(getNext);
}

function str_filter(str){ //cangjie_char
	return str.split('').filter(function(word){
		return using_charmap[word] != null;
	}).join('');
}

function active3(){
	var str = document.getElementById("custom_text").value;
	str = str_filter(str);
	if(!str) return;
	var isUnique = checkUnique(str);
	
	function checkUnique(str){
		var first_char = str.charAt(0);
		for(var i = 1; i < str.length; i++){
			if(str.charAt(i) != first_char){
				return false;
			};
		}
		return true;
	}
	
	var last_char = null;
	var this_char = null;
	active2_extra(function(){
		if(isUnique){
			return getRanChar(str);
		} else {
			last_char = this_char;
			while((this_char = getRanChar(str)) == last_char){};
			return this_char;
		}
		
		function getRanChar(str){
			//add_load_res("charlist.txt");
			//add_load_res("charlist_5000.txt");
			// res[""]
			return str
				.charAt(Math.floor(
				Math.random() * str.length));
		}
	});
};

function active4(){
	var str = document.getElementById("custom_text").value;
	str = str_filter(str);
	if(!str) return;
	var i = 0;
	active2_extra(function(){
		var this_char = str.charAt(i);
		i++;
		if(i >= str.length){
			i = 0;
		}
		
		return this_char;
	});
	
}


var keyHook = (function(){
	
	var currentHandler = null;
	
	addEventListener("keypress",
		function(e){
			if(document.querySelectorAll
				('*:focus:not(button)').length){ //focusing in text field
				return;
			}
			
			currentHandler && currentHandler(e);
		}
	);
	
	return function(handler){
		currentHandler = handler;
	}
})();



function dictionary(search_text){
	var res_ele = document.getElementById("dict-result");
	while(res_ele.firstChild){
		res_ele.removeChild(res_ele.firstChild);
	}
	
	for(var i = 0; i < search_text.length; i++){
		var this_char = search_text.charAt(i);
		var a = (changjie2a[this_char]) || "";
		a = get_html(""+a);
		
		var b = (cangjie_char[this_char]) || "";
		b = get_html(""+b);
		
		res_ele.appendChild(tr([this_char, a, b]));
	}
	
	function get_html(str){
		if(str){
			return str + "<br>" + replace_letter(str);
		} else {
			return str;
		}
	}
	
	function replace_letter(str){
		return str.replace(/[a-y]/gi, function(n){
			return char.charAt(n.charCodeAt() - 97);
		});
	}
	
	function tr(arr){
		var _tr = document.createElement("tr");
		
		for(var i in arr){
			var _td = document.createElement("td");
			_td.innerHTML = (arr[i]);
			_tr.appendChild(_td);
		}
		
		return _tr;
	}
	
}



addEventListener("DOMContentLoaded", function(){
	div_main = id_main.map(function(e){
		return document.getElementById(e);
	});
	
});




//CORE ====

function ajax_load(url, load_handler, error_handler){ //GET
	//call load_handler(responseText, xhr) 
	//    when xhr.status == 200 or 304
	// otherwise call error_handler(xhr)
	// when xhr.readyState == 4
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status == 200 || this.status == 304
				|| /*detect if it is local file*/
				  (this.status == 0 && this.responseURL)) {
				(load_handler)?
				load_handler(this.responseText, this) :
				console.log(this);
			}
			else {
				(error_handler)?
				error_handler(this) :
				console.warn(this);
			}
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}




