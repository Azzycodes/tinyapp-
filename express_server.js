const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  let randomString = "";
  const randomChars = "0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
  for (let i = 0; i < 6; i++) {
    randomString += randomChars[Math.floor(Math.random() * Math.floor(randomChars.length))];
  
  }

  return randomString;
};

const findUser = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user
    }
  }  
  return undefined;
};
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "test01": {longURL: "http://youtube.com", userID: "test1"}
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
  "test1": {
    id: "test1",
    email: "a@a",
    password: "aaa"
  }
};

app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = {user: users[req.cookies["user_id"]]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_register", templateVars);
})

app.get("/login", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_login", templateVars)
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL:
  req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
  } else {
    res.status(404)
  }});

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
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("Please enter email and password"); 
  } else if (findUser(email, user)) {
    res.status(400).send("Already registered email!");
  } else {

  let newUser = generateRandomString();
  newUserObj = {
    user_id: newUser,
    email: email,
    password: password
  };

  users[newUser] = newUserObj;
  res.cookie("user_id", newUser);
  res.redirect("/urls")

}});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user = findUser(email, users)
  if (users[user].email && users[user].password === password) {
  
    res.cookie("user_id", users[user].id);
    res.redirect('/urls');
  } else {
    res.status(403).send("Incorrect email and password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/urls')
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id) {
    delete urlDatabase[req.params.shortURL];

    res.redirect("/urls");
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});