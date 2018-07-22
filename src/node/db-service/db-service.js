// basic route (http://localhost:8080)
const express = require('express');
import User from './user.js';

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

export default function auth({
    app
}) {
    apiRoutes.get('/user/all', function(req, res) {
        User.find((err,users)=>{
            if(err){
                throw err;
            }
            res.send(JSON.stringify((users)));
        })
    });
    return apiRoutes;
}