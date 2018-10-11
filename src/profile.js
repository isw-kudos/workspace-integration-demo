import { get } from 'lodash';
import executeGraphql from './utils';

//graphql query for getting my info
const PROFILE_QUERY = `
  query me {
    me {
      displayName,
      email,
      created,
      createdBy {
        displayName,
        email
      }
    }
  }`;

export default function getProfile(token) {
  return executeGraphql(PROFILE_QUERY, token).then(json =>
    get(json, 'data.me', {})
  );
}
