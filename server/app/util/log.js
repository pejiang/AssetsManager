import config from '../config'
let log = {
	d:function(msg){
		if(config.DEBUG){
			console.log(msg);
		}
	}
}

export default log