





oninstall = function(e){
	console.log("sw oninstall", e);
	
	e.waitUntil(self.skipWaiting());
}

onactivate = function(e){
	console.log("sw onactivate", e);
	
	e.waitUntil(self.clients.claim());
}

var port = null;

self.onmessage = function(e){
	console.log("sw onmessage", e);
	
	var o = e.data;
	
	setTimeout(function(){
		registration.showNotification(o.title,o.options)
		.then(function(){
			
		});
	}, o.delay);
	
}

onnotificationclick = function(e){
	console.log("onnotificationclick", e);
	e.waitUntil(clients.matchAll({type:"window"})
		.then(function(e){
			console.log("windows", e);
			focus_window(e);
		})
	);
}

function focus_window(clientList){
	var e = clientList.filter(function(s){
		return s.url.endsWith("Service_worker.html");
	});
	e.length ? e[0].focus() : 
		clients.openWindow("Service_worker.html");
	
}

self.onfetch = function(e){
	console.log("sw fetch", e)
	
	
	if(e.request.url.endsWith("#123")){
		console.log("#123 456");
		
		/*
		e.respondWith(new Promise(function(a,b){
		//setTimeout(()=>{a(new Response("123"))},1000);
		a(new Response("123"))
		}));*/
		
		e.respondWith(Promise.resolve(new Response("123")));
	}
	
	
}

//console.log("self", self)
/*
setInterval(function(){
	console.log(performance.now())
},500)
*/

