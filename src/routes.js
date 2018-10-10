import { Router } from 'express';
import config from './config';
import getAppAuthToken from './auth';

const { appId, secret } = config;

const router = new Router();

//index
router.route('/').get((req, res) =>
  getAppAuthToken(appId, secret)
    .then(app => res.render('index', { app }))
    .catch(error => res.render('error', { error }))
);

//any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
