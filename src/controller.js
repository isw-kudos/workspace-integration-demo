import { getAppAuthToken, getOAuthRedirectURL, getTokenForCode } from './auth';
import config from './config';
import getProfile from './profile';
import getSpaces from './spaces';
import sendMessage from './message';
import { handleWebhook, getWebhookHistory } from './webhook';
import postAnonymously from './anonymize';

const { appId, secret, redirectUri } = config;

//initialise
let appAuth, user;
getAppAuthToken(appId, secret).then(response => (appAuth = response));
function getAccessToken() {
  return (user || appAuth || {}).access_token;
}

//index
export function index(req, res) {
  res.render('index', { user });
}

//spaces
export function spaces(req, res) {
  getSpaces(getAccessToken())
    .then(spaces => res.render('spaces', { spaces }))
    .catch(error => res.render('error', { error }));
}

//profile
export function profile(req, res) {
  getProfile(getAccessToken())
    .then(profile => res.render('profile', { profile }))
    .catch(error => res.render('error', { error }));
}

//message form
export function messageForm(req, res) {
  getSpaces(getAccessToken())
    .then(spaces => res.render('message', { spaces, sent: req.query.sent }))
    .catch(error => res.render('error', { error }));
}

//send-message
export function message(req, res) {
  sendMessage(req.body, getAccessToken())
    .then(() => res.redirect('/message?sent=true'))
    .catch(error => res.render('error', { error }));
}

//oauth step 1 - redirect
export function redirect(req, res) {
  res.redirect(getOAuthRedirectURL({ appId, redirectUri }));
}

//oauth step 2 - exchange code for token
export function authorize(req, res) {
  const { code, error } = req.query || {};
  if (error) return res.render('error', { error: { statusText: error } });

  getTokenForCode({ appId, secret, redirectUri, code })
    .then(response => {
      user = response;
      res.redirect('/');
    })
    .catch(error => res.render('error', { error }));
}

//webhook handler
export function webhook(req, res) {
  handleWebhook(req, res, config, execute);
}

//list received webhooks
export function webhooks(req, res) {
  res.render('webhooks', { webhooks: getWebhookHistory() });
}

//handler for webhook events
function execute(event) {
  const { type, actionId, spaceId, userId } = event;
  switch (type) {
    case 'welcome': {
      sendMessage(
        {
          spaceId,
          title: 'Howdy! 🎉',
          text: `Thanks for adding me! 🙏
          [Here](https://www.google.com) is some important info about how to make the most of my abilities.
          I look forward to helping you! 😀`,
        },
        appAuth.access_token
      );
      break;
    }

    case 'actionSelected': {
      const [action, ...params] = actionId.split(/\s/);
      const text = params.join(' ');
      if (action === '/anonymize') {
        postAnonymously({
          text,
          userId,
          spaceId,
          token: appAuth.access_token,
        });
      }
      break;
    }

    default:
      console.log('Unactionable event type', type, event);
  }
}
