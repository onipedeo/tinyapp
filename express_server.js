const express = require('express');
const app = express();
const PORT = 8080; //defaults port number

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World!</b></body></html>');
});

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a =${a}`);
});

app.get('/fetch', (req, res) => {
  res.send(`a =${a}`);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body; // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
  let randID = generateRandomString();
  urlDatabase[randID] = longURL['longURL'];
  console.log(urlDatabase);
});

const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charlength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charlength));
  };
  return result;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});