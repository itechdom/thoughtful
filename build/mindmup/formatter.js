"use strict";
const fs = require('fs');
let concepts;

function processItem(obj){
    var pObject = {};
    pObject.title = obj.title;
    pObject.ideas = obj.ideas;
    if(obj.attr && obj.attr.note && obj.attr.note.text){
        pObject.content = obj.attr.note.text;
    }
    pObject.id = obj.id;
    return pObject;
}

function convertToArray(ideas){
  return Object.keys(ideas).map((key)=>{
    return ideas[key];
  })
}

function convertKeyToTitle(ideas){
  return Object.keys(ideas).map((key)=>{
    ideas[ideas[key].title] = ideas[key];
  })
}

function traverse(ideas, parent){
    let tempArr = [];
    let currObj = {};
    Object.keys(ideas).map((key)=> {
        currObj = ideas[key];
        //parent.ideas = convertToArray(ideas);
        convertKeyToTitle(ideas);
        if(currObj.ideas){
           return traverse(currObj.ideas, currObj)
        }
    })
}

fs.readFile('./data/mindmup/Self.site.json', (err, data) => {
  if (err) throw err;
  let skills = JSON.parse(data);
  concepts = skills.ideas["1"].ideas["1"];
  traverse(concepts.ideas, concepts);
  fs.writeFile('./src/javascript/data.json',JSON.stringify(concepts));
});