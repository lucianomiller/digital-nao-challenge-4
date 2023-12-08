const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const crypto = require('crypto');
const csurf = require('csurf');

const GoogleStrategy = require('passport-google-oauth2').Strategy;

const app = express();

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(csurf());

passport.use(new GoogleStrategy({
  clientID: '921337457002-tuchjfeql0hfop79tdfig5r4nu9q2nud.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get('/csrf', (req, res) => {
  res.send(res.locals.csrfToken);
});

app.post('/protegido', (req, res) => {
  res.send('¡Esta ruta está protegida por CSRF!');
});

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get('/auth/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    codeChallenge: crypto.randomBytes(32).toString('base64'),
    codeChallengeMethod: 'S256',
  })
);

app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/protected',
  failureRedirect: '/auth/google/failure'
}));


app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});


app.get('/public-classes', (req, res) => {
  res.json({ classes: ['Hell HIIT', 'Instant crush', 'Lava Tone', 'Drills n Tricks', 'Calisthenics - ft. Bar Bros'] });
});

app.post('/private-classes', isLoggedIn, (req, res) => {
  res.json({ classes: ['Advanced Calisthenics', 'Full-body resistance'] });
});


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor local expuesto en: http://localhost:${PORT}`));
