import { Router } from 'express';
import config from './config';
import getAppAuthToken from './auth';
import getProfile from './profile';
import getSpaces from './spaces';
import sendMessage from './message';

const { appId, secret } = config;

const router = new Router();

//initialise
let auth = {};
getAppAuthToken(appId, secret).then(
  response => console.log('got app token') || (auth = response)
);

//index
router.route('/').get((req, res) => res.render('index'));

//spaces
router.route('/spaces').get((req, res) =>
  getSpaces(auth.access_token)
    .then(spaces => res.render('spaces', { spaces }))
    .catch(error => res.render('error', { error }))
);

//profile
router.route('/profile').get((req, res) =>
  getProfile(auth.access_token)
    .then(profile => res.render('profile', { profile }))
    .catch(error => res.render('error', { error }))
);

//message form
router.route('/message').get((req, res) =>
  getSpaces(auth.access_token)
    .then(spaces => res.render('message', { spaces, sent: req.query.sent }))
    .catch(error => res.render('error', { error }))
);

//send-message
router.route('/send-message').post((req, res) => {
  sendMessage({
    ...req.body,
    token: auth.access_token,
  })
    .then(() => res.redirect('/message?sent=true'))
    .catch(error => res.render('error', { error }));
});

//404 any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
