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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
};

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
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
  let registerEmail = req.body.email;
  let registerPassword = req.body.password;
  if (registerEmail === "" || registerPassword === "") {
    console.log("no data")
    res.send(400) 
  }

  let newUser = generateRandomString();
  newUserObj = {
    user_id: newUser,
    email: registerEmail,
    password: registerPassword
  };

  users[newUser] = newUserObj;
  res.cookie("user_id", newUser);
  res.redirect("/urls")

});

app.post("/login", (req, res) => {
  // TODO: only set cookie if user exists
  res.cookie("user_id", req.body.username)
  res.redirect(`/urls`)
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/urls')
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls/")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});