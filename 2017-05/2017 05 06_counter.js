(function(){
var __except_ele = ["body > div.splash-container > div.splash > h1.splash-head.name",
					"body > div.splash-container > div.splash > h1.splash-head.count.count_live.odometer.odometer-theme-minimal"];
var _eles = [];
for(var i = 0; i < __except_ele.length; i++){
	_eles.push.apply(_eles,document.querySelectorAll(__except_ele[i]));
}

var all = document.all;

for(var i = 0; i < all.length; i++){
	__check(all[i]);
}
function __check(ele){

	if(!hasRelationship(ele,_eles)){
		ele.style.cssText = 'display:none !important';
	}
}

function hasRelationship(ele, ele_list){
	if(ele_list.indexOf(ele) != -1){
		return true;
	}
	for(var i = 0; i < ele_list.length; i++){
		ele2 = ele_list[i];
		if((ele instanceof Node && ele.contains(ele2)) || ele2.contains(ele)
			){
			return true;
		}
	}
	return false;
}

function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}

//https://akshatmittal.com/youtube-realtime/#!/laukinlam
})();
