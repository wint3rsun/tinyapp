const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "user2RandomID"
    }
};

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

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//let cookieParser = require('cookie-parser');
//app.use(cookieParser());

let cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

const bycrypt = require('bcryptjs');

app.set('view engine', 'ejs');


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: findUserUrls(req.session.user_id)
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if(req.session.user_id) {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL,
      userID: req.session.user_id
  }
    console.log(urlDatabase);
    return res.redirect(`/urls/${shortURL}`);
  }
  return res.status(401).send("Unauthorized! Please log in.")
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;

  if (email === "" | password === "") {
    return res.status(400).send("email or password is empty.");
  } else if (getUserbyEmail(email, users)) {
    return res.status(400).send("email already exists!");
  }else {
    users[id] = {
      id,
      email,
      hashedPassword: bycrypt.hashSync(password, 10) 
    };

    req.session.user_id = id;
    return res.redirect("/urls");
  };
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  console.log(users);
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const userID = getUserbyEmail(email, users);

  if (userID) {
    if(bycrypt.compareSync(password, users[userID].hashedPassword)) {
      req.session.user_id = userID;
      return res.redirect("/urls");
    }
    return res.status(403).send("Password does not match records!");
  }

  return res.status(403).send(`User ${email} not found!`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    urls: findUserUrls(req.session.user_id)
  };
  if(templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  return res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    user: users[req.session.user_id],
    shortURL,
    longURL
  };
  if(templateVars.user) {
    return res.render("urls_show", templateVars);
  }
  return res.status(403).send("Unathorized!");
});

app.post("/urls/:shortURL", (req, res) => {
  if(req.session.user_id && (urlDatabase[req.params.shortURL].userID ===req.session.user_id)) {
    let updatedURL = req.body.newLongURL;
    urlDatabase[req.params.shortURL].longURL = updatedURL;
    return res.redirect("/urls");
  }
  return res.status(403).send("Permission denied!");
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];

  if(url) {
    return res.redirect(url.longURL);
  }
  return res.status(404).send("Page not found! Invalid short url.");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;

  if(userId && urlDatabase[req.params.shortURL].userID === userId) {
    delete urlDatabase[req.params.shortURL];
    return res.redirect("/urls");
  }

  return res.status(403).send("permission denied");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});