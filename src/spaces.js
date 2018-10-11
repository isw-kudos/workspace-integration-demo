import { get } from 'lodash';
import { executeGraphql, QUERIES } from './utils';

export default function getSpaces(token) {
  return executeGraphql(QUERIES.spaces(), token).then(json =>
    get(json, 'data.spaces.items', [])
  );
}
