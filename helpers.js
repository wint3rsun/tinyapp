const generateRandomString = function() {
  const alphaNumerics = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  let randomStr = "";

  for (let counter = 0; counter < 6; counter++) {
    const index = Math.floor((Math.random() * alphaNumerics.length)); //generate a random number between 0 and length of alphaNumeric
    randomStr += alphaNumerics[index];
  }

  return randomStr;
};

const findUserUrls = (user_id) => {
  const userURLDatabase = {};
  for (const shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === user_id) {
      userURLDatabase[shortURL] = urlDatabase[shortURL].longURL;
    }
  }

  return userURLDatabase;
}

const getUserbyEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
  return false;
}


module.exports = {
  generateRandomString,
  findUserUrls,
  getUserbyEmail,

}