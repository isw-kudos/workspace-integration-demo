import fetch from 'node-fetch';

const GRAPHQL_URL = 'https://api.watsonwork.ibm.com/graphql';

export default function executeGraphql(body, token) {
  return fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/graphql',
      'x-graphql-view': 'PUBLIC, BETA',
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
