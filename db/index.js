const conn = require('./conn');
const { Sequelize } = conn;
const Product = require('./Product');
const User = require('./User');
const LineItem = require('./LineItem');
const Order = require('./Order');


User.hasMany(Order); //1 to many - UserId on Order
Order.hasMany(LineItem); //1 to many - OrderId on LineItem
LineItem.belongsTo(Product); //1 to 1 - LineItem gets a ProductId


module.exports = {
    conn, 
    User,
    Product,
    Order, 
    LineItem
}

//With all the models separated out and required in index.js
//we can now just require('./db') for any future components
