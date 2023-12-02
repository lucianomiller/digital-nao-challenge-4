const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;


passport.use(new GoogleStrategy({
  clientID: '921337457002-tuchjfeql0hfop79tdfig5r4nu9q2nud.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true,
  authorizationURLParams: {
    response_type: 'code',
    code_challenge_method: 'S256',
  },
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