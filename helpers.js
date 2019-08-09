// searches if user with that email exists, returns user object 
const findUser = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
};

// returns URLs of a specifc userID
const urlsForUser = function(userID, urlDatabase) {
  let output = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      output[key] = urlDatabase[key].longURL;
    }
  }
  return output;
};

// returns random 6 character string
function generateRandomString() {
  let randomString = "";
  const randomChars = "0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM";
  for (let i = 0; i < 6; i++) {
    randomString += randomChars[Math.floor(Math.random() * Math.floor(randomChars.length))];
  
  }

  return randomString;
};

module.exports = { findUser, urlsForUser, generateRandomString };