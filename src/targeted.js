import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import { pickBy } from 'lodash';
import { executeGraphql } from './utils';

export default function createTargetedMessage(response, annotation, token) {
  const { title, text } = response;

  //default message
  if (!text && !title)
    response = {
      title: 'Error',
      text: 'Oops something went wrong. Please try again.',
    };
  //remove any null or unexpected properties
  else response = pickBy({ title, text }, prop => !!prop);

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
                genericAnnotation: response,
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
