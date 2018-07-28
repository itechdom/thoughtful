import { observable, computed, autorun, action, reaction } from "mobx";
import uuidV4 from "uuid/v4";
import superagent from "superagent";
import { HOST } from "../config.js";
import queryString from "query-string";
import moment from "moment";

export class Thoughtful {
  //store just ids
  @observable ideaList = {};
  @observable level;
  @observable maxLevel;
  @observable pendingRequestCount;
  @observable isLoggedIn = false;
  @observable loading = false;
  @observable nodeEditOpen = false;
  @observable nodeEdited = { title: "Hello", note: "TEXT" };
  @observable fileList = [];
  @observable filteredFileList = [];
  accessToken;
  minLevel;

  constructor() {
    this.ideaList;
    this.level = 1;
    const parsed = queryString.parse(location.search);
    this.accessToken = this.storeAccessToken(parsed.access_token);
    this.refreshToken = this.storeRefreshToken(parsed.refresh_token);
  }

  traverse(idea) {
    let ideas = idea.ideas;
    if (ideas) {
      Object.keys(ideas).map(key => {
        ideas[key] = new Idea(ideas[key]);
        this.traverse(ideas[key]);
      });
    }
  }

  storeAccessToken(token) {
    if (token) {
      localStorage.setItem("accessToken", token);
    }
  }

  getAccessToken() {
    let storedToken = localStorage.getItem("accessToken");
    return storedToken;
  }

  storeRefreshToken(token) {
    if (token) {
      localStorage.setItem("refreshToken", token);
    }
  }

  getRefreshToken() {
    let storedToken = localStorage.getItem("refreshToken");
    return storedToken;
  }

  auth() {
    let token = this.getAccessToken();
    if (token) {
      return token;
    } else {
      console.log("no auth token");
    }
  }

  @computed
  get files() {
    return this.filteredFileList.map(file => {
      return file.title;
    });
  }

  @computed
  get ideas() {
    if (this.ideaList.ideas) {
      return this.ideaList.ideas;
    }
    return [];
  }

  @action
  filterFilesByTitle(title) {
    this.filteredFileList = this.fileList.filter(file => {
      return file.title.indexOf(title) !== -1;
    });
  }

  @action
  incrementLevel() {
    this.level++;
  }

  @action
  decremenetLevel() {
    if (this.level !== 1) {
      return this.level--;
    }
  }

  @action
  toggleChildVisible(node) {
    node.visible = !node.visible;
    this.level--;
    this.level++;
  }

  @action
  login() {
    let loginURL = `${HOST}/google/auth`;
    window.open(loginURL);
  }

  @action
  isAuthenticated() {
    this.pendingRequestCount++;
    let req = superagent.get(`${HOST}/file/list`);
    req.end(
      action("login-callback", (err, res) => {
        this.pendingRequestCount--;
        if (err) {
          this.isLoggedIn = false;
          return console.log("err: ", err);
        }
        return (this.isLoggedIn = true);
      })
    );
  }

  @action
  getFiles(title) {
    this.pendingRequestCount++;
    this.loading = true;
    let token = this.getAccessToken();
    let refresh_token = this.getRefreshToken();
    let body = { token: token, refresh_token: refresh_token };
    let req;
    if (title) {
      req = superagent.post(`${HOST}/google/file/list/manual`);
      body.fileName = title;
    } else {
      req = superagent.post(`${HOST}/google/file/list`);
    }
    req.send(body).end(
      action("file-callback", (err, res) => {
        if (err) {
          console.log("err: ", err);
        }
        if (res.status === 401) {
          console.log(err);
          // this.login();
        }
        this.loading = false;
        this.fileList.push(...res.body);
        this.pendingRequestCount--;
      })
    );
  }

  @action
  addIdea(parent) {
    let newIdea = {title:"new node"};
    let newId;
    if(Object.keys(parent.ideas).length > 0){
      let lastKey = Object.keys(parent.ideas).slice(-1).pop();
      newId = parseFloat(lastKey);
    }
    if(newId >= 0){
      newId++;
    }else if(newId < 0){
      newId--;
    }else{
      newId = "0";
    }
    newIdea.id = newId;
    newIdea.ideas = {};
    let idea = new Idea(newIdea);
    parent.ideas[`${newId}`] = new Idea(idea);
    parent.visible = true;
    if(parent.visible){
      parent.visible = false;
      setTimeout(()=>{
        parent.visible = true;
      })
    }
  }

  @action
  removeIdea(parent,child){
    Object.keys(parent.ideas).map(key=>{
      if(parent.ideas[key] === child){
        delete parent.ideas[key];
      }
    })
  }

  @action
  editFile() {
    this.pendingRequestCount++;
    this.loading = true;
    let token = this.getAccessToken();
    let refresh_token = this.getRefreshToken();
    let body = { token: token, refresh_token: refresh_token };
    console.log(this.ideaList);
    let req;
    req = superagent.put(`${HOST}/google/file`);
    req.send(body).end(
      action("file-callback", (err, res) => {
        if (err) {
          console.log("err: ", err);
        }
        if (res.status === 401) {
          console.log(err);
          // this.login();
        }
        this.loading = false;
        this.fileList.push(...res.body);
        this.pendingRequestCount--;
      })
    );
  }

  /**
   * Download a file's content.
   *
   * @param {File} file Drive File instance.
   * @param {Function} callback Function to call when the request is complete.
   */
  download(callback) {
    var file = this.filteredFileList[0];
    this.loading = true;
    if (file.downloadUrl) {
      var accessToken = this.getAccessToken();
      var xhr = new XMLHttpRequest();
      xhr.open("GET", file.downloadUrl);
      xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
      xhr.onload = () => {
        this.loading = false;
        callback(xhr.responseText);
      };
      xhr.onerror = function() {
        console.log("ERROR");
        callback(null);
      };
      xhr.send();
    } else {
      callback("NO FILE!");
    }
  }

  @action
  downloadFile() {
    var file = this.filteredFileList[0];
    this.pendingRequestCount++;
    let token = this.getAccessToken();
    let refresh_token = this.getRefreshToken();
    let req = superagent.post(`${HOST}/google/file/download`);
    req
      .send({ token: token, refresh_token: refresh_token, file_id: file.id })
      .end(
        action("file-callback", (err, res) => {
          if (err) {
            console.log("err: ", err);
          }
          if (res.status === 401) {
            return console.log(err);
          }
          var ideas = res.body;
          this.traverse(ideas);
          this.ideaList = ideas;
          this.pendingRequestCount--;
        })
      );
  }
}

export class Idea {
  id;
  title;
  attr;
  style;
  ideas;
  date;
  text;
  @observable visible = false;
  constructor(obj) {
    this.id = obj.id;
    this.title = obj.title;
    this.ideas = obj.ideas;
    this.style = obj.style;
    this.visible = false;
    this.date = obj.date || moment();
    this.rerender = false;
    if (obj.attr && obj.attr.note && obj.attr.note.text) {
      this.note = obj.attr.note.text;
    }
    if (obj.attr && obj.attr.attachment && obj.attr.attachment.content) {
      this.note = obj.attr.attachment.content;
    }
  }
}
