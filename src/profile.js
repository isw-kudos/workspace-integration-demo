import { get } from 'lodash';
import { executeGraphql, QUERIES } from './utils';

export default function getProfile(token) {
  return executeGraphql(QUERIES.me(), token).then(json =>
    get(json, 'data.me', {})
  );
}
