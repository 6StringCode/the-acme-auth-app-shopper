const Sequelize = require('sequelize'); //we'll move this out later
const config = {}; 
if(process.env.QUIET){
    config.logging = false;
}
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_auth_db', config);

module.exports = conn;