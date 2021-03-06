var config = new Map();

config.set('port', 8080);
config.set('host', '0.0.0.0');
config.set('app_folder', './public');
config.set('db_host', 'mongo');
config.set('db_port', '27017');
config.set('db_name', 'whoami');
config.set('jwt_secret', 'mySecret');
config.set('api_baseURL', '/api/');

module.exports = config;