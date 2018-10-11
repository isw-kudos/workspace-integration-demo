import { executePostQuery, URLS } from './utils';

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
    URLS.message(spaceId),
    { 'Content-type': 'application/json' },
    body,
    token
  );
}
