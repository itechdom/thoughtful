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
var autoIncrement = require("mongoose-auto-increment");

// =================================================================
// configuration ===================================================
// =================================================================
var port = config.get("server.port"); // used to create, sign, and verify tokens
var ip = config.get("server.ip");
var connection = mongoose.createConnection(
  `${config.get("db.host")}:${config.get("db.port")}/${config.get("db.name")}`
);
autoIncrement.initialize(connection);
app.set("superSecret", config.secret); // secret variable

// =================================================================
// Import web services ========================================
// =================================================================
var ChatLog = require("./thoughtful-service/models/chat-log")({
  autoIncrement
}); // get our mongoose model
var User = require("./thoughtful-service/models/user"); // get our mongoose model

import authService from "./auth-service/auth-service.js";
const authApi = authService({ app, User });

import helloService from "./hello-service/hello-service.js";
const helloApi = helloService({ app, User });

import translateService from "./translate-service/translate-service.js";
const translateApi = translateService({ app, User, config });

import thoughtfulService from "./thoughtful-service/thoughtful-service.js";
const thoughtfulApi = thoughtfulService({ app, User, config });

import passportService from "./passport-service/passport-service.js";
const passportApi = passportService({ app, User, config });

import socketService from "./socket-service/socket-service.js";
const socketApi = socketService({
  app,
  ip,
  port,
  onEvent: (eventName, eventData) => {
    if (eventName === "chat") {
      let { username, text, translations } = eventData;
      fs.appendFile(__dirname + "/log.txt", "\rn" + JSON.stringify(eventData));
      let date = new Date();
      let chatLog = new ChatLog({ username, text, translations, date });
      chatLog.save((err, data) => {
        console.log("after chat save", data);
        if (err) {
          console.error(err);
        }
      });
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

app.use("/hello", helloApi);
app.use("/", passportApi);
app.use("/socket-io", socketApi);
app.use("/", translateApi);
app.use("/", thoughtfulApi);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port, ip);
console.log(`Magin happens at ${ip}:${port}`);
