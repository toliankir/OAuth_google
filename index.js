const express = require('express');
const path = require('path');
const fs = require('fs');
const request = require('request');
const ejs = require('ejs');
const app = express();

app.set("view engine", "ejs");

const client_id = '168338020470-8bgidgkifihqeqvmj29q94m9gvug0qte.apps.googleusercontent.com';
const client_secret = 'D1D_4ugkXdBFJM2Xy5BYF4Y0';
const scope = 'https://www.googleapis.com/auth/analytics.readonly+https://www.googleapis.com/auth/userinfo.email';
const dataBase = path.join(__dirname, 'data.json');

let db = {};

fs.access(dataBase, fs.constants.F_OK, (err) => {
    if (err) {
        console.log('Data base file don\'t foound');
        return;
    }
    fs.readFile(dataBase, (err, data) => {
        if (err) {
            console.log('Reading file error');
            return;
        }
        try {
            db = JSON.parse(data);
        } catch (err) {
            console.log('JSON parse error');
        }

    })
})

app.get('/', (req, res) => {
    // if (!db.id_token) {
    request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
        headers: {
            'Authorization': `${db.token_type} ${db.access_token}`
        }
    }, (err, resp, body) => {
        if (err) {
            console.log('Request with token error')
            return;
        }
        res.render("index", {
            client_id: client_id,
            db: db,
            user_data: JSON.parse(body),
            callback_url: 'http://localhost:3000/google'
        });
    
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
        console.log(body);
        body.access_token ? db.access_token = body.access_token : null;
        body.refresh_token ? db.refresh_token = body.refresh_token : null;
        body.id_token ? db.id_token = body.id_token : null;
        body.token_type ? db.token_type = body.token_type : null;
        body.expires_in ? db.expires_in = body.expires_in : null;
        writeDB(dataBase, db);
    });
});

app.listen(3000, () => {
    console.log('Server start on 3000')
})

function writeDB(dbFile, data) {
    fs.writeFile(dbFile, JSON.stringify(data), (err) => {
        if (err) {
            console.log('Database writeeing error');
            return;
        }
    });
}