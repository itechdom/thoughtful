import React from "react";
import ReactDOM from "react-dom";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Router, Route, IndexRoute, Link, hashHistory } from "react-router";
import { Tabs, Tab } from "material-ui/Tabs";
import { Card, CardHeader, CardText } from "material-ui/Card";
import AutoComplete from "material-ui/AutoComplete";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import AppBar from "material-ui/AppBar";
import FontIcon from "material-ui/FontIcon";
import MapsPersonPin from "material-ui/svg-icons/maps/person-pin";
import "normalize.css";
import io from "socket.io-client";
import axios from "axios";
import { blue500, red500, greenA200 } from "material-ui/styles/colors";
import { languages } from "../languages";
import styles from '../styles.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    axios.get("http://localhost:8081/languages").then(response => {
      console.log(response);
    });
    this.state = {
      text: "",
      textReceived: [],
      connected: false,
      languages: languages.map(lang => lang.name),
      language: "",
      username: ""
    };
    this.handleTextChange = this.handleTextChange.bind(this);
    this.chat = this.chat.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleLanguageUpdate = this.handleLanguageUpdate.bind(this);

    //register socket connection
    this.socket = io("http://ec2-34-210-228-39.us-west-2.compute.amazonaws.com:8082");
  }

  componentDidMount() {
    //listen in on change
    this.socket.on("init", msg => {
      console.log("connected to the server:", msg);
      this.setState({ connected: true });
    });
    this.socket.on("chat", msg => {
      this.setState({ textReceived: [...this.state.textReceived, msg] });
      var objDiv = document.getElementById("scrollable");
      objDiv.scrollTop = objDiv.scrollHeight;
    });
  }

  handleKeyPress(e) {
    if (e.key === "Enter") {
      this.chat();
    }
  }

  chat() {
    let { text, username, language } = this.state;
    this.socket.emit("chat", { text, username, language });
    this.setState({ text: "" });
  }

  handleTextChange(event, newVal) {
    this.setState({ text: newVal });
  }

  handleLanguageUpdate(language) {
    let res = languages.find(
      l => language.toLowerCase() === l.name.toLowerCase()
    );
    if (res) {
      this.setState({ language: res.code });
    }
    else {
      this.setState({ language });
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="row" style={{ padding: "0 10px", margin: "0 10px" }}>
          <AppBar
            style={{ textAlign: "center" }}
            title={<span style={styles.title}>Thoughtful</span>}
          />
          <FontIcon
            className="material-icons"
            color={this.state.connected ? greenA200 : red500}
          >
            cast_connected
          </FontIcon>
          <TextField
            hintText="Enter your Username"
            fullWidth={true}
            onChange={(event, text) => {
              this.setState({ username: text });
            }}
            onKeyPress={this.handleKeyPress}
            value={this.state.username}
          />
          <AutoComplete
            hintText="Pick a language"
            dataSource={this.state.languages}
            searchText={this.state.selectedLanguage}
            onUpdateInput={this.handleLanguageUpdate}
          />
          <TextField
            hintText="Enter your message"
            fullWidth={true}
            onChange={this.handleTextChange}
            onKeyPress={this.handleKeyPress}
            value={this.state.text}
          />
          <RaisedButton label="Submit" primary={true} onClick={this.chat} />
          <div
            id="scrollable"
            style={{ overflowY: "scroll", maxHeight: "500px" }}
          >
            {this.state.textReceived.map((msg,index) => (
              <Paper key={index} style={{ padding: "0.5em", marginTop: "10px" }} zDepth={1}>
                <p>
                  <FontIcon
                    style={{ marginRight: "0.1em" }}
                    className="material-icons"
                  >
                    person_pin
                  </FontIcon>
                  <b>{msg.username}</b>
                </p>
                <p>{msg.text}</p>
                {Object.keys(msg.translations)
                  .sort(lang => (lang === this.state.language ? -1 : 1))
                  .map((lang,index) => {
                    return (
                      <p key={index} style={{ textAlign: "right" }}>
                        {msg.translations[lang]}
                      </p>
                    );
                  })}
              </Paper>
            ))}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
  componentWillReceiveProps() {}
}

ReactDOM.render(<App name="hello" />, document.getElementById("app"));
