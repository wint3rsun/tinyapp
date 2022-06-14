const generateRandomString = function() {
  const alphaNumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let randomStr = "";

  for (let counter = 0; counter < 6; counter++) {
    const index = Math.floor((Math.random() * alphaNumerics.length)); //generate a random number between 0 and length of alphaNumeric
    randomStr += alphaNumerics[index];
  }

  return randomStr;
};

const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "btxVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL , longURL};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  let updatedURL = req.body.newLongURL;
  urlDatabase[req.params.shortURL] = updatedURL;
  console.log("after edit database: ", urlDatabase);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const {username} = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});