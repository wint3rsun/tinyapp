const generateRandomString = function() {
  const alphaNumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let randomStr = "";

  for (let counter = 0; counter < 6; counter++) {
    const index = Math.floor((Math.random() * alphaNumerics.length)); //generate a random number between 0 and length of alphaNumeric
    randomStr += alphaNumerics[index];
  }

  return randomStr;
};

const urlDatabase = {
  "btxVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const findUserbyEmail = (emailAddress) => {
  for (const user in users) {
    if (users[user].email === emailAddress) {
      return user;
    }
  }
  return false;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },  
};

const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs');


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if(req.cookies["user_id"]) {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = longURL;
    console.log(urlDatabase);
    return res.redirect(`/urls/${shortURL}`);
  }
  return res.status(401).send("Unauthorized! Please log in.")
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  console.log(`result of findUserByEmail is: ${findUserbyEmail(email)}`);

  if (email === "" | password === "") {
    res.status(400).send("email or password is empty.");
  } else if (findUserbyEmail(email)) {
    res.status(400).send("email already exists!");
  }else {
    users[id] = {
      id,
      email,
      password
    };

    res.cookie("user_id", id);
    res.redirect("/urls");
  };
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  console.log(users);
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userID = findUserbyEmail(email);

  if (userID) {
    if(users[userID].password === password) {
      res.cookie("user_id", userID);
      return res.redirect("/urls");
    }
    return res.status(403).send("Password does not match records!");
  }

  return res.status(403).send(`User ${email} not found!`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  if(templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL,
    longURL
  };
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

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});