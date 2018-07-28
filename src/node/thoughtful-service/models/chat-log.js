var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = ({ autoIncrement }) => {
  let chatLogSchema = new Schema({
    username: String,
    translations: Object,
    text: String,
    date: Date
  });
  chatLogSchema.plugin(autoIncrement.plugin, {
    model: "ChatLog",
    field: "chatId"
  });
  return mongoose.model("ChatLog", chatLogSchema);
};
