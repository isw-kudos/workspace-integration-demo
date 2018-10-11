import { Router } from 'express';
import config from './config';
import getAppAuthToken from './auth';
import getProfile from './profile';
import getSpaces from './spaces';

const { appId, secret } = config;

const router = new Router();

//index
router.route('/').get((req, res) =>
  getAppAuthToken(appId, secret)
    .then(({ access_token }) =>
      Promise.all([getProfile(access_token), getSpaces(access_token)])
    )
    .then(([profile, spaces]) => res.render('index', { profile, spaces }))
    .catch(error => res.status(error.status || 500).render('error', { error }))
);

//any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
