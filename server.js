const app = require('./app');
const { conn, User, Product } = require('./db');


const setUp = async()=> {
    try {
        await conn.sync({ force: true });
        await User.create({ username: 'moe', password: 'moe_pw' });
        const lucy = await User.create({ username: 'lucy', password: 'lucy_pw' });
        const keyboard = await Product.create({ name: 'keyboard' });
        const trackball = await Product.create({ name: 'trackball' });
        
        await lucy.addToCart({ product: keyboard, quantity: 2 });
        await lucy.addToCart({ product: trackball, quantity: 1 });
        const port = process.env.PORT || 3001;
        app.listen(port, ()=> console.log(`listening on port ${port}`));
    }
    catch(ex){
        console.log(ex);
    }
}

setUp();