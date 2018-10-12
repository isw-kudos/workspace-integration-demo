import { EnumType, jsonToGraphQLQuery } from 'json-to-graphql-query';
import { pickBy } from 'lodash';
import { executeGraphql } from './utils';

const ERROR_RESPONSE = {
  title: 'Error',
  text: 'Oops something went wrong. Please try again.',
};

export default function createTargetedMessage(response, annotation, token) {
  //json query is easier to construct
  const { conversationId, createdBy, targetDialogId } = annotation;
  if (!targetDialogId) return Promise.reject('No targetDialogId in annotation');

  const formattedResponse = Array.isArray(response)
    ? formatArray(response)
    : format(response);
  const query = {
    mutation: {
      createTargetedMessage: {
        __args: {
          input: {
            conversationId,
            targetUserId: createdBy,
            targetDialogId,
            ...formattedResponse,
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
  const formatted = {};

  //default message
  if (!response.text && !response.title) response = ERROR_RESPONSE;

  //adjust buttons syntax
  if (response.buttons) {
    response.buttons = response.buttons.map(({ text, payload, style }) => ({
      postbackButton: {
        title: text,
        id: payload,
        style: new EnumType(style),
      },
    }));
  }

  //remove any null or unexpected properties
  const { title, text, buttons } = response;
  formatted.annotations = [
    {
      genericAnnotation: pickBy({ title, text, buttons }, prop => !!prop),
    },
  ];
  return formatted;
}

function formatArray(response = []) {
  const formatted = {};

  //default message
  if (!response.length) return format(ERROR_RESPONSE);

  //if array of objects create cards
  formatted.attachments = response.map(obj => {
    if (obj.buttons) {
      obj.buttons = obj.buttons
        .filter(b => !!b)
        .map(({ style, ...button }) => ({
          ...button,
          style: new EnumType(style),
        }));
    }
    return {
      type: new EnumType('CARD'),
      cardInput: {
        type: new EnumType('INFORMATION'),
        informationCardInput: obj,
      },
    };
  });

  return formatted;
}
