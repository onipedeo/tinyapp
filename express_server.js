const express = require('express');
const app = express();
const PORT = 3000; //defaults port number

//import helpers module
const { findUserByEmail, generateRandomString } = require('./helpers');

//Dependencies
const bcrypt = require("bcryptjs");
const session = require('cookie-session');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'user_id',
  keys: ['motunrayo', "ijaodola", " Olumose"],

  //Cookie Option
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

//set view engine to ejs
app.set('view engine', 'ejs');

/*
E- DATABASES
*/
// Users Object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "tbitcoin485@gmail.com",
    password: bcrypt.hashSync("1", (10))
  }
};

//List of shortening ids and the longURLs
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
  "Tchs7c": {
    longURL: "http://www.yahoo.com",
    userID: "aw48lW",
  },
  "Tchs8c": {
    longURL: "http://www.yahoo.ca",
    userID: "aw48lW",
  }
};

/*
*Functions
*/

//Function to filter the logged in UserID
const urlsForUser = function(id) {
  let result = {};
  for (const keys in urlDatabase) {
    if (urlDatabase[keys].userID === id) {
      result[keys] = urlDatabase[keys];
    }
  }
  return result;
};


/*
ROUTES
*/

//send the list of our shortened links to the client in an object format
app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});

//Renders the urls_index page when a get request to /urls is made
app.get('/urls', (req, res) => {
  //Check if User owns the url
  const userID = req.session.user_id;
  if (userID) {
    const usersURL = urlsForUser(userID);

    const templateVars = {
      urls: usersURL,
      user: users[userID]
    };
    res.render('urls_index', templateVars);
  }
  res.send(`
  <div>
    <h3>Please login or Register<h3>
    <a href="/login">Login</a>
    <a href="/register">Register</a>
  </div>`);
});



//Renders the add new Tiny url page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  //check if user is already logged in
  if (!(userID && users[userID])) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    urls: urlDatabase.ID,
    user: users[userID]
  };
  res.render("urls_new", templateVars);
});



//Redirects to longURL when a get request on our shortened url is received.
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  //Error handling when invalid Id is used.
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found');
  }
});



//Renders the urls_show page
app.get('/urls/:id', (req, res) => {
  //Check if user is logged in or not
  const userID = req.session.user_id;
  if (!(userID && users[userID])) {
    res.send('Please Login to view Urls');
    return;
  }
  //Check if User owns the url
  const usersURL = urlsForUser(userID);
  const longURL = usersURL[req.params.id];

  if (longURL) {
    const templateVars = {
      id: req.params.id,
      longURL: longURL.longURL,
      user: users[userID]
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('This URL doesn\'t belong to you');
  }
});



//Handles the post request from the new tiny url request from the website and redirects to the tinyurl page.
app.post("/urls", (req, res) => {
  //Check if user is logged in or not
  const userID = req.session.user_id;
  if (!(userID && users[userID])) {
    res.send('Please Login to post a new Url');
    return;
  }

  //Sets new shortened url for new URL
  const longURL = req.body.longURL;
  const randID = generateRandomString();

  //sets new url and assign to user that created it in the database
  urlDatabase[randID] = {};
  urlDatabase[randID]['longURL'] = longURL;
  urlDatabase[randID]['userID'] = userID;

  //Redirects to myUrl for logged in user
  res.redirect(`/urls/${randID}`);
});



//Update URLS route
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;

  //checks if url exists in database
  if (urlDatabase[id].longURL) {
    urlDatabase[id].longURL = newURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});



//Delete Urls
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  //Check if User owns the url
  const userID = req.session.user_id;
  const usersURL = urlsForUser(userID);
  const longURL = usersURL[id];

  //Delete URL if it exists under the user's URL in the database
  if (longURL) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.send('This URL doesn\'t belong to you');
  }
});




//Handle login link
app.get("/login", (req, res) => {
  //check encrypted cookie exist
  const userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect('/urls');
    return;
  }
  res.render("urls_login", { user: null });
});



//Request from the /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email, users);

  //check if no email or password is inputed in login screen
  if (email === '' || password === '') {
    res.status(400).send('Error 400: Email and/or Password cannot be empty');
    return;
  }
  //checks user and incorrect password
  if (user && !bcrypt.compareSync(password, user.password)) {
    res.status(403).send('Error 403: Permission denied/Password Incorrect');
    return;
  }

  //checks if user and correct password, then redirects to urls page.
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
    return;
  }
  // handles users not found in datatbase
  res.status(403).send('Error 403: User not Found');
  return;
});



//logout and clears session
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});



// Registration page route
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID && users[userID]) {
    res.redirect('/urls');
    return;
  }
  res.render('urls_reg', { user: null });
});




//REgistration requests from the registration page
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.status(400).send('Error 400: Email and/or Password cannot be empty');
    return;
  } else {
    const checkIfUserExists = findUserByEmail(email, users);
    if (checkIfUserExists !== null) {
      res.status(400).send('Error 400: User already exists');
      return;
    }
  }
  const randUserID = generateRandomString();
  //hashing password
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[randUserID] = {
    id: randUserID,
    email,
    password: hashedPassword
  };
  req.session.user_id = randUserID;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});