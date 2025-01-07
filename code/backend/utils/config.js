require('dotenv').config();

const PORT = process.env.PORT;
const UI_URI = process.env.UI_URI;
const SERVER_URI = process.env.SERVER_URI;

module.exports = {
  PORT,
  UI_URI,
  SERVER_URI
};