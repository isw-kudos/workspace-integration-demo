import getAppAuthToken from './auth';
import config from './config';
import getProfile from './profile';
import getSpaces from './spaces';
import sendMessage from './message';

const { appId, secret } = config;

//initialise
let auth = {};
getAppAuthToken(appId, secret).then(
  response => console.log('got app token') || (auth = response)
);

//index
export function index(req, res) {
  res.render('index');
}

//spaces
export function spaces(req, res) {
  getSpaces(auth.access_token)
    .then(spaces => res.render('spaces', { spaces }))
    .catch(error => res.render('error', { error }));
}

//profile
export function profile(req, res) {
  getProfile(auth.access_token)
    .then(profile => res.render('profile', { profile }))
    .catch(error => res.render('error', { error }));
}

//message form
export function messageForm(req, res) {
  getSpaces(auth.access_token)
    .then(spaces => res.render('message', { spaces, sent: req.query.sent }))
    .catch(error => res.render('error', { error }));
}

//send-message
export function message(req, res) {
  sendMessage(req.body, auth.access_token)
    .then(() => res.redirect('/message?sent=true'))
    .catch(error => res.render('error', { error }));
}
