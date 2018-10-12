import { getAppAuthToken, getOAuthRedirectURL, getTokenForCode } from './auth';
import config from './config';
import getProfile from './profile';
import getSpaces from './spaces';
import sendMessage from './message';
import { handleWebhook, getWebhookHistory } from './webhook';
import postAnonymously from './anonymize';
import postRelevantXkcd from './xkcd';
import createTargetedMessage from './targeted';

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
  const { actionId, spaceId, userId, userName, annotationType } = event;
  const token = appAuth.access_token;
  switch (annotationType) {
    case 'welcome': {
      sendMessage(
        {
          spaceId,
          title: 'Howdy! 🎉',
          text: `Thanks for adding me! 🙏
          [Here](https://www.google.com) is some important info about how to make the most of my abilities.
          I look forward to helping you! 😀`,
        },
        token
      );
      break;
    }

    case 'actionSelected': {
      const [action, ...params] = actionId.split(/\s/);
      const text = params.join(' ');
      let executing;
      if (action === '/anonymize') {
        executing = postAnonymously({
          text,
          userId,
          spaceId,
          token: appAuth.access_token,
        });
      } else if (action === '/xkcd') {
        executing = postRelevantXkcd({
          search: text,
          userId,
          spaceId,
          userName,
          token,
        });
      }

      //send feedback if executing action
      if (executing)
        executing
          .catch(err => console.log('Error executing', err) || err)
          .then(response => createTargetedMessage(response, event, token))
          .catch(err => console.log('Error creating targeted dialog', err));
      break;
    }

    //Focus annotation
    case 'message-focus':
      console.log(
        '\nWatson has identified a Focus - lens, confidence, phrase, categories\n',
        event.lens, // 'ActionRequest', 'Question' 'Commitment'
        event.confidence,
        event.phrase,
        event.categories
      );
      break;

    //Moment annotation
    case 'conversation-moment':
      console.log(
        '\nWatson identified a moment - participants, phrases, mostRelevantMessage\n',
        event.participants,
        event.momentSummary.phrases,
        event.momentSummary.mostRelevantMessage
      );
      break;

    //Information extraction annotation
    case 'message-nlp-docSentiment':
      console.log(
        '\nWatson analyzed message sentiment\n',
        event.docSentiment.type,
        event.docSentiment.score
      );
      break;
    case 'message-nlp-keywords':
      console.log(
        '\nWatson identified some keywords\n',
        event.keywords //text, relevance
      );
      break;
    case 'message-nlp-concepts':
      console.log(
        '\nWatson identified some concepts\n',
        event.concepts //dbpedia, text, relevance
      );
      break;
    case 'message-nlp-entities':
      console.log(
        '\nWatson identified entities\n',
        event.entities //text, type, relevance
      );
      break;
    case 'message-nlp-taxonomy':
      console.log(
        '\nWatson has identified taxonomy\n',
        event.taxonomy //label, score, confident
      );
      break;

    default:
      console.log('Unactionable annotationType', annotationType);
  }
}
