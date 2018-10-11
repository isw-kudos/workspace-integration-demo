import fetch from 'node-fetch';
import qs from 'querystring';
import { URLS } from './utils';

export default function getAppAuthToken(appId, secret) {
  //encode appId and secret
  const credentials = Buffer.from(`${appId}:${secret}`).toString('base64');

  //get access token to auth as app
  return fetch(URLS.token(), {
    method: 'post',
    body: qs.stringify({ grant_type: 'client_credentials' }),
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-type': 'application/x-www-form-urlencoded',
    },
  }).then(res => (res.ok ? res.json() : Promise.reject(res)));
}
