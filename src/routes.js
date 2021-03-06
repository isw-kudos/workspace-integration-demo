import { Router } from 'express';
import {
  index,
  spaces,
  profile,
  messageForm,
  message,
  redirect,
  authorize,
  webhook,
  webhooks,
} from './controller';

const router = new Router();

//index
router.route('/').get(index);

//spaces
router.route('/spaces').get(spaces);

//profile
router.route('/profile').get(profile);

//message form
router.route('/message').get(messageForm);

//send-message
router.route('/send-message').post(message);

//oauth
router.route('/oauth').get(redirect);

//oauth redirect
router.route('/oauth/redirect').get(authorize);

//webhook handler
router.route('/webhook').post(webhook);

//webhooks history view
router.route('/webhooks').get(webhooks);

//404 any other route
router.use((req, res) =>
  res.render('error', { error: { status: 404, statusText: 'Not Found' } })
);

export default router;
