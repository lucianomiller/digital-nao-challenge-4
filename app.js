const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const secret = require('./secret.json');

const app = express();

// Define users array

app.listen(3000, () => {
  console.log('El servidor está escuchando en el puerto 3000');
});

app.use(session({
  secret: secret.secret,
  resave: false,
  saveUninitialized: false,
  saveChangesOnly: true,
}));

app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

// API inicial

const authenticateUser = (req, res, next) => {
  // Check if user is authenticated
  if (req.session && req.session.user) {
    // User is authenticated, proceed to the next middleware
    next();
  } else {
    // User is not authenticated, send an error response
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check if username and password are valid
  if (username === 'admin' && password === 'password') {
    // Set the user in the session
    req.session.user = username;
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.get('/', authenticateUser, (req, res) => {
  res.json({
    message: 'Hola mundo',
  });
});
