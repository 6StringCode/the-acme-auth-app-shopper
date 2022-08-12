const express = require('express');
const app = express();
const { User } = require('./db');
const path = require('path');

app.use(express.json());

app.get('/', (req, res)=> res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/sessions', async(req, res, next)=> {
    try {
        const credentials = {
            username: req.body.username,
            password: req.body.password
        }
        res.send({ token: await User.authenticate(credentials) });
        //moved logic from route to db User.authenticate method
    }
    catch(ex){
        next(ex)
    }
});

// app.get('/api/sessions/:token', async(req, res, next)=> {
//     try {
//         res.send(await User.findByToken(req.params.token));
//     }
//     catch(ex){
//         next(ex);
//     }
// })
//send as header instead of token
app.get('/api/sessions', async(req, res, next)=> {
    try {
        res.send(await User.findByToken(req.headers.authorization));
    }
    catch(ex){
        next(ex);
    }
})

module.exports = app;