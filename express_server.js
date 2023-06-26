const express = require('express');
const app = express();
const PORT = 3000; //defaults port number

const cookieParser = require('cookie-parser');
app.use(cookieParser());

//set view engine to ejs
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

//List of shortening ids and the longURLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "Tchs7c": "http://www.yahoo.com"
};
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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

//Renders the add new Tiny url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});
//Redirects to longURL when a get request on our shortened url is received.
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  //Error handling when invalid Id is used.
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('URL not found');
  }
});

//Renders the urls_show page
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

//Handles the post request from the new tiny url request from the website and redirects to the tinyurl page.
app.post("/urls", (req, res) => {
  const longURL = req.body; // Log the POST request body to the console
  let randID = generateRandomString();
  urlDatabase[randID] = longURL['longURL'];
  res.redirect(`/urls/${randID}`); // Respond with 'Ok' (we will replace this)
});

//Update URLS
app.post('/urls/:id', (req, res) => {
  const ID = req.params.id;
  const newURL = req.body.newURL;

  if (urlDatabase[ID]) {
    urlDatabase[ID] = newURL;
    res.redirect('/urls');
  } else {
    res.status(404).send('URL not found');
  }
});
//Delete Urls
app.post('/urls/:id/delete', (req, res) => {
  const ID = req.params.id;
  delete urlDatabase[ID];
  res.redirect('/urls');
});

//Request from the /login
app.post("/login", (req, res) => {
  const cookie = req.body.username;
  res.cookie("username", cookie);
  res.redirect("/urls");
});

//logout and clears cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});