import config from '../config'
import assets from '../controller/assets'
import posctl from '../controller/position'
import rp from 'request-promise'
import {db} from '../sqldb'

export default (compatible) => {
	return {
		position:async (data) => {
			// console.log('position data :',data);
			if(!koa_app.token || (Date.now() - koa_app.token.time) / 1000 > koa_app.token.expires_in){
				koa_app.token = await getToken(config.ac_server,config.developer.key,config.developer.secret);
				koa_app.token.time = Date.now();
	        	console.log('Got token --------> ',koa_app.token);
			}
			//级联查询
			let all = await assets().all({
				include:[{
					model: db.position,
					as: 'pos_hist',
					order: [['uid', 'DESC']],
					limit: 1
				}]
			});
			for(let i in all){
				let instance = all[i];
				let asset = instance.get()
				// console.log(11111111111, instance, instance.get('pos_hist'))
				if(data[asset['mac']]){
					console.log(data[asset['mac']])
					let res = await getPosition(config.ac_server,data[asset['mac']][0].mac,koa_app.token.access_token);
					console.log('get position -------->',res.name);
					// let position = await posctl().find_by('asset_mac', asset['mac'])
					if(res.name){
						if(instance.get('pos_hist').length == 0){
							let pos = await posctl().create({history: res.name});
							instance.addPos_hist(pos)							
						}else{
							let history = instance.get('pos_hist')[0].get('history')
							if(!history || history != res.name){
								let pos = await posctl().create({history: res.name});
								instance.addPos_hist(pos)
							}							
						}

					}
					// if(position && position.history){
					// 	let last = position.history[position.history.length - 1];
					// 	if(last.name != res.name){
					// 		position.history.push({time:Date.now(), name:res.name});
					// 		await posctl().update(asset['mac'], position);
					// 	}
					// }else{
					// 	let p = {
					// 		id:asset['mac'],
					// 		history:[{time:Date.now(),name:res.name}]
					// 	}
					// 	await posctl().create(p);
					// }

				}
			}

		},
		battery:async (data) => {
			console.log('battery data :',data);
		},
		collect:async (data)=> {
			console.log('collect data:' ,data);
		},
		sleep:async (data)=> {
			console.log('sleep data:' ,data);
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

let getToken = async (server,key,secret) => {
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

	return await rp(options);
	// return new Promise((resolve,reject) => {
	// 	rp(options)
	//     	.then(function (token) {
	//         	resolve(token);
	//     	})
	//     	.catch(function (err) {
	//         // API call failed...
	//         	reject(err)
	//  		});
	// })
}
