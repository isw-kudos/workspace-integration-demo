import { get } from 'lodash';
import executeGraphql from './utils';

//graphql query for getting spaces
const GET_SPACES_QUERY = `
  query getSpaces {
    spaces(first: 250) {
      items {
        id
        title
      }
    }
  }`;

export default function getSpaces(token) {
  return executeGraphql(GET_SPACES_QUERY, token).then(json =>
    get(json, 'data.spaces.items', [])
  );
}
