const express = require("express");
var google = require("googleapis");
var OAuth2 = google.auth.OAuth2;
// Imports the Google Cloud client library
const Translate = require("@google-cloud/translate");
// Your Google Cloud Platform project ID
const projectId = "thoughtful-210601";

import { detectLanguage, translateText, listLanguages } from "./utils";

// Instantiates a client
const translate = new Translate({
  projectId: projectId
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

export default function({ app, User, config }) {
  //client ID and secret
  let clientId = config.get("auth.google.clientId");
  let clientSecret = config.get("auth.google.clientSecret");
  let callbackURL = config.get("auth.google.callbackURL");

  var oauth2Client = new OAuth2(clientId, clientSecret, callbackURL);

  var drive = google.drive({
    version: "v2",
    auth: oauth2Client
  });

  //   // // route middleware to verify a token
  //   apiRoutes.use(function(req, res, next) {
  //     // check header or url parameters or post parameters for token
  //     var token =
  //       req.body.token || req.query.token || req.headers["x-access-token"];
  //     // decode token
  //     if (token || req.method === "OPTIONS" || req.url.indexOf("/auth") !== -1) {
  //       // Retrieve tokens via token exchange explained above or set them:
  //       oauth2Client.setCredentials({
  //         access_token: token,
  //         refresh_token: req.body.refresh_token
  //       });
  //       next();
  //     } else {
  //       // if there is no token
  //       // return an error
  //       return res.status(403).send({
  //         success: false,
  //         message: "No token provided."
  //       });
  //     }
  //   });

  apiRoutes.get("/", function(req, res) {
    res.send("Hello! Passport service is working");
  });

  apiRoutes.get("/error", function(req, res) {
    res.status(401).send({ message: "Error Logging In!" });
  });
  //sync with google bookamarks
  apiRoutes.post("sync");

  apiRoutes.get("/auth", function(req, res) {
    // generate a url that asks permissions for Google+ and Google Calendar scopes
    const scopes = ["https://www.googleapis.com/auth/translate"];
    var url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",

      // If you only need one scope you can pass it as a string
      scope: scopes

      // Optional property that passes state parameters to redirect URI
      // state: 'foo'
    });
    res.redirect(url);
  });

  apiRoutes.get("/auth/callback", (req, res) => {
    oauth2Client.getToken(req.query.code, function(err, tokens) {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (!err) {
        let redirectUrl = `http://localhost:8080?access_token=${
          tokens.access_token
        }&refresh_token=${tokens.refresh_token}`;
        return res.redirect(redirectUrl);
      } else {
        return res.send(err);
      }
    });
  });

  apiRoutes.get("/languages", (req, res) => {
    listLanguages().then(languages => {
      res.send(languages);
    });
  });

  apiRoutes.post("/languages/detect", (req, res) => {
    let text = req.body.text;
    detectLanguage(text).then(detections => {
      res.send(detections);
    });
  });

  apiRoutes.post("/translate", (req, res) => {
    // The text to translate
    const text = req.body.text;
    const target = req.body.target;
    translateText(text, target).then(translations => {
      res.send(translations);
    });
    // The target language
  });

  return apiRoutes;
}
