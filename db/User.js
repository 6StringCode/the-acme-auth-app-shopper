const conn = require('./conn');
const { Sequelize } = conn;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


const User = conn.define('user', {
    username: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    }
});

User.addHook('beforeSave', async(user)=> {
    user.password = await bcrypt.hash(user.password, 5); //5 is # of salt rounds
});

User.prototype.createOrderFromCart = async function(){
    const cart = await this.getCart();
    cart.isCart = false;
    return cart.save();
}

User.prototype.addToCart = async function({ product, quantity }){
    const cart = await this.getCart(); //gets cart and thus Order.id => turns it into cart.id
    //let lineItem = await LineItem.findOne({
    //after separating out the models, we can access the conn.model like below
    let lineItem = await conn.models.lineItem.findOne({
        where: {
            productId: product.id,
            orderId: cart.id
        }
    })
    if(lineItem){
        lineItem.quantity = quantity;
        if(lineItem.quantity){
            await lineItem.save();
        }
        else {
            await lineItem.destroy();
        }
    }
    else {
        await conn.models.lineItem.create({ productId: product.id, quantity, orderId: cart.id });
    }
    return this.getCart();
}

//this finds an Order/Cart that matches the UserId fk to the User(this).id
User.prototype.getCart = async function(){
    let order = await conn.models.order.findOne({
        where: {
            userId: this.id, //instance method can just use this
            isCart: true
        },
        include: [
            conn.models.lineItem
        ]
    });
    //if there's not cart/order, create one setting the fk userId to this.id
    if(!order){
        order = await conn.models.order.create({ userId: this.id })
        order = await conn.models.order.findByPk(order.id, {
            include: [conn.models.lineItem]
        })
    }
    //console.log(order);
    return order;
}

User.authenticate = async function(credentials){
    const user = await this.findOne({
        where: {
            username: credentials.username
        }
    })
    if(user && await bcrypt.compare(credentials.password, user.password, )){
        return jwt.sign({ id: user.id }, process.env.JWT);
    }
    else {
        const error = new Error('Bad Credentials');
        error.status = 401;
        throw error;
    }
}

User.findByToken = async function findByToken(token){
    try {
        const id = jwt.verify(token, process.env.JWT).id;
        const user = await User.findByPk(id);
        if(!user){
            throw 'error';
        }
        return user;
    }
    catch(ex){
        const error = new Error('bad token');
        error.status = 401;
        throw error;
    }
}

module.exports = User;