// =================================================================
// get the packages we need ========================================
// =================================================================
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var morgan = require("morgan");
var mongoose = require("mongoose");
var config = require("config"); // get our config file
var fs = require("fs");

// =================================================================
// configuration ===================================================
// =================================================================
var port = config.get("server.port"); // used to create, sign, and verify tokens
var ip = config.get("server.ip");
// mongoose.connect(`${config.get("db.host")}:${config.get("db.port")}`); // connect to database
app.set("superSecret", config.secret); // secret variable

// =================================================================
// Import web services ========================================
// =================================================================
var User = require("./db-service/user"); // get our mongoose model
var ChatLog = require("./db-service/chat-log"); // get our mongoose model

import authService from "./auth-service/auth-service.js";
const authApi = authService({ app, User });

import helloService from "./hello-service/hello-service.js";
const helloApi = helloService({ app, User });

import translateService from "./translate-service/translate-service.js";
const translateApi = translateService({ app, User, config });

import dbService from "./db-service/db-service.js";
const dbApi = dbService({ app });

// import passportService from './passport-service/passport-service.js'
// const passportApi = passportService({app,User,config});

import socketService from "./socket-service/socket-service.js";
const socketApi = socketService({
  app,
  ip,
  port,
  onEvent: (eventName, eventData) => {
    if (eventName === "chat") {
      console.log(eventData);
      //save to DB here
      let { username, text, translations } = eventData;
      fs.appendFile(__dirname + "/log.txt", "\rn" + JSON.stringify(eventData));
    }
  }
});

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// use morgan to log requests to the console
app.use(morgan("dev"));

// ==========
// Register Services
// ==========

//app.use('/', authApi);
app.use("/hello", helloApi);
//app.use('/db',dbApi);
//app.use('/',passportApi);

app.use("/socket-io", socketApi);
app.use("/", translateApi);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port, ip);
console.log(`Magin happens at ${ip}:${port}`);
