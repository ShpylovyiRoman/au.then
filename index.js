'use strict';

const express = require('express');
const passport = require('passport');
const { readEnv } = require('./utils');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;


const GITHUB_CLIENT_ID = readEnv('GITHUB_CLIENT_ID');
const GITHUB_CLIENT_SECRET = readEnv('GITHUB_CLIENT_SECRET');
const SESSION_SECRET = readEnv('AU_THEN_SESSION_SECRET');
const PORT = readEnv('AU_THEN_PORT', 1773);


// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session.  Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.  However, since this example does not
// have a database of user records, the complete GitHub profile is serialized
// and deserialized.
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));


const githubConfig = {
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/callback/github'
};

const githubVerify = (_accessToken, _refreshToken, profile, done) => {
  // To keep the example simple, the user's GitHub profile is returned to
  // represent the logged-in user.  In a typical application, you would want
  // to associate the GitHub account with a user record in your database,
  // and return that user instead.
  done(null, profile);
};

passport.use(new GitHubStrategy(githubConfig, githubVerify));

const app = express();

app.set('view engine', 'ejs');

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', ensureAuthenticated, (_req, res) => {
  res.redirect('/account');
});

// Displays account information
app.get('/account', ensureAuthenticated, (req, res) => {
  res.render('account', { user: req.user });
});

// Main authentication page
app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

// Endpoint for redirecting to the github
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

// Callback from github
app.get('/auth/callback/github',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (_, res) => {
    res.redirect('/');
  });

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

const port = parseInt(PORT);
app.listen(port);
console.log(`Serving at the ${port} port`);

// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected.  If
// the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
