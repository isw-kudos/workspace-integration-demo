import { executePostQuery } from './utils';

const MESSAGE_URL = spaceId =>
  `https://api.watsonwork.ibm.com/v1/spaces/${spaceId}/messages`;

export default function sendMessage(message, token) {
  const { spaceId, text, color, title, actorName, actorAvatar } = message;

  const body = JSON.stringify({
    type: 'appMessage',
    version: '1',
    annotations: [
      {
        type: 'generic',
        version: '1',
        text,
        title,
        color,
        actor: {
          name: actorName,
          avatar: actorAvatar,
        },
      },
    ],
  });

  return executePostQuery(
    MESSAGE_URL(spaceId),
    { 'Content-type': 'application/json' },
    body,
    token
  );
}
