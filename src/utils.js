import fetch from 'node-fetch';
import { jsonToGraphQLQuery } from 'json-to-graphql-query';

export const URLS = {
  base: 'https://api.watsonwork.ibm.com',
  graphql: () => `${URLS.base}/graphql`,
  token: () => `${URLS.base}/oauth/token`,
  authorize: query => `${URLS.base}/oauth/authorize?${query}`,
  message: spaceId => `${URLS.base}/v1/spaces/${spaceId}/messages`,
  photo: userId => `${URLS.base}/photos/${userId}.jpg`,
};

export const QUERIES = {
  spaces: (num = 200) => `
    query getSpaces {
      spaces(first: ${num}) {
        items {
          id
          title
        }
      }
    }`,
  me: () => `
      query me {
        me {
          displayName,
          email,
          photoUrl,
          created,
          createdBy {
            displayName,
            email
          }
        }
      }`,
};

export function executeGraphql(body, token) {
  body = typeof body === 'string' ? body : jsonToGraphQLQuery(body);
  return executePostQuery(
    URLS.graphql(),
    {
      'Content-Type': 'application/graphql',
      'x-graphql-view': 'PUBLIC, BETA',
    },
    body,
    token
  );
}

export function executePostQuery(url, headers = {}, body, token) {
  return fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
    body,
  })
    .then(response => {
      const { ok, status, statusText } = response;
      if (ok) return response.json();
      return Promise.reject({ status, statusText });
    })
    .then(json => {
      //check for errors
      if (json.errors && json.errors.length)
        return Promise.reject({
          status: 500,
          statusText: JSON.stringify(json.errors),
        });
      return json;
    });
}
