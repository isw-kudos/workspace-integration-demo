import sendMessage from './message';
import postAnonymously from './anonymize';
import { postRelevantXkcd, suggestXkcd } from './xkcd';
import createTargetedMessage from './targeted';

//handler for webhook events
export default function execute(token, event) {
  const { actionId, spaceId, userId, userName, annotationType } = event;
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
          token,
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
        '\nWatson analyzed message sentiment - type, score\n',
        event.docSentiment.type,
        event.docSentiment.score
      );
      break;
    case 'message-nlp-keywords':
      console.log(
        '\nWatson identified some keywords\n',
        event.keywords //text, relevance
      );
      suggestXkcd(getStringFromKeywords(event.keywords), spaceId, token);
      break;
    case 'message-nlp-concepts':
      console.log(
        '\nWatson identified some concepts\n',
        event.concepts //dbpedia, text, relevance
      );
      suggestXkcd(getStringFromKeywords(event.concepts), spaceId, token);
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

function getStringFromKeywords(keywords, confidence = 0.8) {
  return keywords
    .filter(w => w.relevance > confidence)
    .map(w => w.text)
    .join(' ');
}
