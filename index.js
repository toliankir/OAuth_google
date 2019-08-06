const express = require('express');
const path = require('path');
const request = require('request');
const ejs = require('ejs');
const app = express();

app.set("view engine", "ejs");

const client_id = '168338020470-8bgidgkifihqeqvmj29q94m9gvug0qte.apps.googleusercontent.com';
const client_secret = 'D1D_4ugkXdBFJM2Xy5BYF4Y0';
const scope = 'https://www.googleapis.com/auth/analytics.readonly+https://www.googleapis.com/auth/userinfo.email';

app.get('/', (req, res) => {
    res.render("index", {
        client_id: client_id,
        scope: scope,
        callback_url: 'http://localhost:3000/google'
    });
});

app.get('/google', (req, res) => {
    if (req.query.code) console.log(`User code: ${req.query.code}`);
    res.send(`code ${req.query.code}`);
    request.post('https://www.googleapis.com/oauth2/v4/token', {
        json: {
            code: req.query.code,
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: 'http://localhost:3000/google',
            grant_type: 'authorization_code'
        }
    }, (err, res, body) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Status code: ${res.statusCode}`);
        console.log(`Access token: ${body.access_token}`);
        console.log(`Refresh token: ${body.refresh_token}`);
        console.log(body);
    });
});

app.listen(3000, () => {
    console.log('Server start on 3000')
})