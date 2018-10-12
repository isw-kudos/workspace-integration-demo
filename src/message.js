import { executePostQuery, URLS, executeGraphql } from './utils';

export default function sendMessage(message, token) {
  const {
    spaceId,
    text,
    color,
    title,
    actorName,
    actorAvatar,
    action,
  } = message;

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
  ).then(response => {
    if (!action) return response;
    const focusConfig = {
      actions: [action],
      messageId: response.id,
      phrase: text,
      start: 0,
      end: text.length,
      payload: 'payload',
      hidden: false,
    };
    return addMessageFocus(focusConfig, token);
  });
}

function addMessageFocus(focusConfig, token) {
  const { messageId, phrase, start, end, actions, payload } = focusConfig;
  const query = {
    mutation: {
      addMessageFocus: {
        __args: {
          input: {
            messageId,
            messageFocus: {
              phrase,
              lens: 'Kudos Boards',
              actions,
              payload,
              start,
              end,
              version: 1,
              hidden: true,
            },
          },
        },
        message: {
          id: true,
        },
      },
    },
  };
  return executeGraphql(query, token).catch(err =>
    console.log('workspace/api - messages - error adding focus', err)
  );
}
