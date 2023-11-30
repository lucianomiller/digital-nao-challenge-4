const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const users = {}; 

app.use(session({
  secret: 'llave-secreta',
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  users[email] = { password: hashedPassword, confirmed: false };
  
  res.status(201).send('Usuario creado');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and password is correct
  if (users[email] && await bcrypt.compare(password, users[email].password)) {
    // Generate JWT token
    const token = jwt.sign({ email }, 'secret-key', { expiresIn: '1h' });

    res.json({ token });
  } else {
    res.status(401).send('Credenciales inválidas');
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'secret-key', (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

app.get('/public-classes', (req, res) => {
  res.json({ classes: ['Hell HIIT', 'Instant crush', 'Lava Tone', 'Drills n Tricks', 'Calisthenics - ft. Bar Bros'] });
});

app.get('/private-classes', authenticateToken, (req, res) => {
  res.json({ classes: ['Advanced Calisthenics', 'Full-body resistance'] });
});

app.get('/user-info', authenticateToken, (req, res) => {
  const { email } = req.user;
  const userInfo = users[email];

  if (userInfo) {
    res.json(userInfo);
  } else {
    res.status(404).send('Usuario no encontrado');
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor local expuesto en: http://localhost:${PORT}`));