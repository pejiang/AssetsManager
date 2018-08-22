export default (
    {
        redis: {
            port: 6379,
            host: '10.0.10.242'
        },
        fs: {
            path: './db/'
        },
        export_version:'1.0',
        mongo: 'mongodb://localhost/cassiadb',
        db: 'redis',
        https: {
            ssl: {
                key: './usr/ssl/ac.key',
                cert: './usr/ssl/ac.pem'
            },
            listen: 443
        },
        http: {
            listen: 8888
        },
        use: 'http',
        ac_server:'http://10.0.10.240',
        developer:{
            key:"huijia",
            secret:"huijia"
        },
        DEBUG: true
    }
);
