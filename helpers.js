/*
HELPER FUNCTIONS
*/
// Function to find a user by email
const findUserByEmail = function(userEmail, database) {
  let currentUserObj;

  for (const user in database) {
    if (database[user]["email"] === userEmail) {
      currentUserObj = database[user];
      return currentUserObj;
    }
  }
  return;
};


//Generates randomID for our tiny urls
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charlength));
  }
  return result;
};

module.exports = { findUserByEmail, generateRandomString };