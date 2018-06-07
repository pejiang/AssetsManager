export default (
    {
        redis: {
            port: 6379,
            host: '192.168.0.143'
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
        ac_server:'http://192.168.0.227',
        developer:{
            key:"tester",
            secret:"10b83f9a2e823c47"
        },
        DEBUG: true
    }
);