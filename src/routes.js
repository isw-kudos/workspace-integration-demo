import { Router } from 'express';
import config from './config';
import getAppAuthToken from './auth';
import getProfile from './profile';

const { appId, secret } = config;

const router = new Router();

//index
router.route('/').get((req, res) =>
  getAppAuthToken(appId, secret)
    .then(app => getProfile(app.access_token))
    .then(profile => res.render('index', { profile }))
    .catch(error => res.render('error', { error }))
);

//any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
