import { Router } from 'express';
import config from './config';
import getAppAuthToken from './auth';
import getProfile from './profile';
import getSpaces from './spaces';

const { appId, secret } = config;

const router = new Router();

//initialise
let appAuth = {};
getAppAuthToken(appId, secret).then(
  app => console.log('got app token') || (appAuth = app)
);

//index
router.route('/').get((req, res) => res.render('index'));

//spaces
router.route('/spaces').get((req, res) =>
  getSpaces(appAuth.access_token)
    .then(spaces => res.render('spaces', { spaces }))
    .catch(error => res.render('error', { error }))
);

//profile
router.route('/profile').get((req, res) =>
  getProfile(appAuth.access_token)
    .then(profile => res.render('profile', { profile }))
    .catch(error => res.render('error', { error }))
);

//404 any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
