import config from '../config'
import assets from '../controller/assets'
import position from '../controller/position'
import rp from 'request-promise'

export default (compatible) => {
	return {
		position:async (data) => {
			// console.log('position data :',data);
			if(!koa_app.token || (Date.now() - koa_app.token.time) / 1000 > koa_app.token.expires_in){
				koa_app.token = await getToken(config.ac_server,config.developer.key,config.developer.secret);
				koa_app.token.time = Date.now();
	        	console.log('Got token --------> ',koa_app.token);
			}
			let res = await assets().all();
			for(let i in res){
				let asset = res[i];
				if(data[asset['mac']]){
					console.log(data[asset['mac']])
					let res = await getPosition(config.ac_server,data[asset['mac']],koa_app.token.access_token);
					console.log('get position -------->',res.name);
					let pos = await position().find(asset['mac'])
					if(pos && !pos.ps){
						let p = pos.ps[pos.ps.length - 1];
						if(p.pos != res.name){
							pos.ps.push({time:Date.now(),pos:res.name});
							await position().update(asset['mac'],pos);
						}
					}else{
						let p = {
							id:asset['mac'],
							ps:[{time:Date.now(),pos:res.name}]
						}
						await position().create(p);
					}

				}
			}

		},
		battery:async (data) => {
			console.log('battery data :',data);
		}
	}
}

let getPosition = (server,mac,token) => {
	// url = http://192.168.0.227/api/cassia/hubs/CC:1B:E0:E0:04:B4
	var options = {
	    uri: `${server}/api/cassia/hubs/${mac}`,
	    qs: {
	        access_token: `${token}` // -> uri + '?access_token=xxxxx%20xxxxx'
	    },
	    // headers: {
	    //     'User-Agent': 'Request-Promise'
	    // },
	    json: true // Automatically parses the JSON string in the response
	};

	return new Promise((resolve,reject) => {
		rp(options)
		    .then(function (res) {
		    	resolve(res)
		    })
		    .catch(function (err) {
		        // API call failed...
		        reject(err)
		    });	
	});	


}

let getToken = (server,key,secret) => {
	console.log('getToken : server = %s ; key = %s ; secret = %s',server,key,secret)
	let options = {
		method: 'POST',
	    uri: server + '/api/oauth2/token',
	    headers: {'Cache-Control': 'no-cache',
     	'Authorization': 'Basic ' + Buffer.from(`${key}:${secret}`,'ascii').toString('base64'),
     	'Content-Type': 'application/json' 
     	},
  		body: { 
  			grant_type: 'client_credentials' 
  		},
	    json: true // Automatically parses the JSON string in the response
	};

	return new Promise((resolve,reject) => {
		rp(options)
	    	.then(function (token) {
	        	resolve(token);
	    	})
	    	.catch(function (err) {
	        // API call failed...
	        	reject(err)
	 		});
	})
}