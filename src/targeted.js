import { EnumType, jsonToGraphQLQuery } from 'json-to-graphql-query';
import { pickBy } from 'lodash';
import { executeGraphql } from './utils';

export default function createTargetedMessage(response, annotation, token) {
  //json query is easier to construct
  const { conversationId, createdBy, targetDialogId } = annotation;
  if (!targetDialogId) return Promise.reject('No targetDialogId in annotation');

  const query = {
    mutation: {
      createTargetedMessage: {
        __args: {
          input: {
            conversationId,
            targetUserId: createdBy,
            targetDialogId,
            annotations: [
              {
                genericAnnotation: format(response),
              },
            ],
          },
        },
        successful: true,
      },
    },
  };

  //convert json to graphql query
  return executeGraphql(jsonToGraphQLQuery(query), token);
}

//translate response to WW API requirements
function format(response = {}) {
  const { title, text } = response;
  let { buttons } = response;

  //default message
  if (!text && !title)
    response = {
      title: 'Error',
      text: 'Oops something went wrong. Please try again.',
    };

  //adjust buttons syntax
  if (buttons) {
    buttons = buttons.map(({ text, payload, style }) => ({
      postbackButton: {
        title: text,
        id: payload,
        style: new EnumType(style),
      },
    }));
  }

  //remove any null or unexpected properties
  response = pickBy({ title, text, buttons }, prop => !!prop);

  return response;
}
