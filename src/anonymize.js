import Chance from 'chance';
import sendMessage from './message';

const chance = new Chance();

//store aliases so that they are the same on reposts
const aliases = {};

export default function postAnonymously({ text, userId, spaceId, token }) {
  //generate alias for user
  if (!aliases[userId]) aliases[userId] = chance.last();
  //post message
  return sendMessage(
    {
      spaceId,
      text,
      actorName: aliases[userId],
      title: '(Pseudonym)',
    },
    token
  ).then(() => ({
    title: 'Your message was sent!',
    text: `Your message was posted under the pseudonym *${aliases[userId]}*`,
  }));
}
