import Chance from 'chance';
import sendMessage from './message';

const chance = new Chance();

//store aliases so that they are the same on reposts
const aliases = {};

export default function postAnonymously({ text, userId, spaceId, token }) {
  //if text starts with change-alias, set the change flag
  const change = text.match(/^\s*change-alias(.*)/);
  if (change) text = change[1].trim();

  let alias = aliases[userId];

  //need to confirm alias on first run or if running change-alias
  const needToConfirm = !alias || change;

  //send confirmation response if alias confirmation is required
  if (needToConfirm) {
    aliases[userId] = alias = chance.last();

    return Promise.resolve({
      title: 'Please Confirm Alias',
      text: `Your messages will be posted under the alias "${alias}"`,
      //button payload needs to have full context of command, so we pass in the text as well
      buttons: [
        {
          text: 'Confirm',
          payload: `/anonymize ${text}`,
          style: 'PRIMARY',
        },
        {
          text: 'Shuffle',
          payload: `/anonymize change-alias ${text}`,
          style: 'SECONDARY',
        },
      ],
    });
  }

  //if it was just a change-alias request
  if (!text) return Promise.resolve({ text: 'Your request was processed' });

  //post message
  return sendMessage(
    {
      spaceId,
      text,
      actorName: alias,
      title: '(Alias)',
    },
    token
  ).then(() => ({
    title: 'Your message was sent!',
    text: `Your message was posted under the alias *${aliases[userId]}*
    Run the command \`/anonymize change-alias\` to change your alias.`,
  }));
}
