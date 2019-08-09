const express = require("express");
const bcrypt = require("bcrypt");
const { findUser, urlsForUser, generateRandomString } = require ("./helpers");
const cookieSession = require('cookie-session');
const app = express();

app.use(cookieSession({
  name: "session",
  keys: ["game"],
  maxAge: 24 * 60 * 60 * 1000
}));
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "test01": {longURL: "http://youtube.com", userID: "test1"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("ccc", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("bbb", 10)
  },
  "test1": {
    id: "test1",
    email: "a@a",
    password: bcrypt.hashSync("aaa", 10)
  }
};

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars = {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});

app.get("/", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else res.redirect("/login");
});

app.get("/urls", (req, res) => {
  if(!req.session["user_id"]) {
    res.status(400).send("Please log in to edit URLs");
  } else {
  let urlsOfUser = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { urls: urlsOfUser, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
}
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].longURL) {
    let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Please Log in");  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.statusCode = 200;
  let shortString = generateRandomString();
  urlDatabase[shortString] = { longURL: req.body.longURL, userID: req.session.user_id };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortString}`);
});

app.post("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id] && (req.session.user_id)) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("Must log in to edit URL");
  }
});
 
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("Please enter email and password");
  } else if (findUser(email, users)) {
    res.status(400).send("Already registered email!");
  } else {

    let newUser = {
      id: generateRandomString(),
      email: email,
      password: bcrypt.hashSync(req.body.password, 10)
    };

    users[newUser.id] = newUser;
    req.session["user_id"] =  newUser.id;
    res.redirect("/urls");

  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = users[findUser(email, users)];
  console.log(users[user]);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session["user_id"] = user.id;
    res.redirect('/urls');
  } else {
    res.status(403).send("Incorrect email and password");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

