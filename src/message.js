import { executePostQuery } from './utils';

const MESSAGE_URL = spaceId =>
  `https://api.watsonwork.ibm.com/v1/spaces/${spaceId}/messages`;

export default function sendMessage({ spaceId, text, color, title, token }) {
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
