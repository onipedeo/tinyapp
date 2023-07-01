const express = require('express');
const app = express();
const PORT = 3000; //defaults port number

//Dependencies
const bcrypt = require("bcryptjs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

//set view engine to ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

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
HELPER FUNCTIONS
*/
// Function to find a user by email
const findUserByEmail = function(userEmail) {
  let currentUserObj;

  for (const user in users) {
    if (users[user]["email"] === userEmail) {
      currentUserObj = users[user];
      return currentUserObj;
    }
  }
  return null;
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

//send a response when client visits the root of or website
app.get('/', (req, res) => {
  res.send('Hello');
});
//send the list of our shortened links to the client in an object format
app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World!</b></body></html>');
});

//Renders the urls_index page when a get request to /urls is made
app.get('/urls', (req, res) => {
  //Check if User owns the url
  const userID = req.cookies.user_id;
  if (userID) {

    const usersURL = urlsForUser(userID);

    const templateVars = {
      urls: usersURL,
      user: users[req.cookies.user_id]
    };
    res.render('urls_index', templateVars);
  }
  res.redirect('/login');
  // res.send(`
  // <div>
  //   <h3>Please login or Register<h3>
  //   <a href="/login">Login</a>
  //   <a href="/register">Register</a>
  // </div>`);
});

//Renders the add new Tiny url page
app.get("/urls/new", (req, res) => {
  if (!(req.cookies.user_id && users[req.cookies.user_id])) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    urls: urlDatabase.ID,
    user: users[req.cookies.user_id]
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
  if (!(req.cookies.user_id && users[req.cookies.user_id])) {
    res.send('Please Login to view Urls');
    return;
  }
  //Check if User owns the url
  const userID = req.cookies.user_id;
  const usersURL = urlsForUser(userID);
  const longURL = usersURL[req.params.id];

  if (longURL) {
    const templateVars = {
      id: req.params.id,
      longURL: longURL.longURL,
      user: users[req.cookies.user_id]
    };
    res.render('urls_show', templateVars);
  } else {
    res.send('This URL doesn\'t belong to you');
  }
});

//Handles the post request from the new tiny url request from the website and redirects to the tinyurl page.
app.post("/urls", (req, res) => {
  //Check if user is logged in or not
  if (!(req.cookies.user_id && users[req.cookies.user_id])) {
    res.send('Please Login to post a new Url');
    return;
  }
  const userID = req.cookies.user_id;
  const longURL = req.body.longURL; // Log the POST request body to the console
  let randID = generateRandomString();
  urlDatabase[randID] = {};
  urlDatabase[randID]['longURL'] = longURL;
  urlDatabase[randID]['userID'] = userID;

  res.redirect(`/urls/${randID}`); // Respond with 'Ok' (we will replace this)
});

//Update URLS
app.post('/urls/:id', (req, res) => {
  const ID = req.params.id;
  const newURL = req.body.newURL;

  if (urlDatabase[ID].longURL) {
    urlDatabase[ID].longURL = newURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});
//Delete Urls
app.post('/urls/:id/delete', (req, res) => {
  const ID = req.params.id;
  //Check if User owns the url
  const userID = req.cookies.user_id;
  const usersURL = urlsForUser(userID);
  const longURL = usersURL[ID];

  if (longURL) {
    delete urlDatabase[ID];
    res.redirect('/urls');
  } else {
    res.send('This URL doesn\'t belong to you');
  }
});

//Handle login link
app.get("/login", (req, res) => {
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);

});

//Request from the /login
app.post("/login", (req, res) => {
  for (const user_id in users) {
    if (req.body.email === '' || req.body.password === '') {
      res.status(400).send('Error 400: Email and/or Password cannot be empty');
      return;
    }

    if (users[user_id].email === req.body.email && !bcrypt.compareSync(req.body.password, users[user_id].password)) {
      res.status(403).send('Error 403: Permission denied/Password Incorrect');
      return;
    }
    if (users[user_id].email === req.body.email && bcrypt.compareSync(req.body.password, users[user_id].password)) {
      res.cookie('user_id', user_id);
      res.redirect('/urls');
      return;
    }
  }
  res.status(403).send('Error 403: User not Found');
  return;
});

//logout and clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Registration page route
app.get("/register", (req, res) => {
  if (req.cookies.user_id && users[req.cookies.user_id]) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render('urls_reg', templateVars);
});


//REgistration requests from the registration page
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Error 400: Email and/or Password cannot be empty');
    return;
  } else {
    const checkIfUserExists = findUserByEmail(req.body.email);
    if (checkIfUserExists !== null) {
      res.status(400).send('Error 400: User already exists');
      return;
    }
  }
  const randUserID = generateRandomString();
  //hashing password
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[randUserID] = {
    id: randUserID,
    email: req.body.email,
    password: hashedPassword
  };
  res.cookie("user_id", randUserID);

  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});