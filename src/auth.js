import fetch from 'node-fetch';
import qs from 'querystring';
import { URLS } from './utils';

function getAppAuthHeader(appId, secret) {
  const credentials = Buffer.from(`${appId}:${secret}`).toString('base64');
  return {
    Authorization: `Basic ${credentials}`,
    'Content-type': 'application/x-www-form-urlencoded',
  };
}

export function getAppAuthToken(appId, secret) {
  return fetch(URLS.token(), {
    method: 'post',
    body: qs.stringify({ grant_type: 'client_credentials' }),
    headers: getAppAuthHeader(appId, secret),
  }).then(res => (res.ok ? res.json() : Promise.reject(res)));
}

export function getOAuthRedirectURL({ appId, redirectUri }) {
  const query = qs.stringify({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: 'test.state',
  });
  return URLS.authorize(query);
}

export function getTokenForCode({ appId, secret, redirectUri, code }) {
  //request body
  const body = qs.stringify({
    client_id: appId,
    client_secret: secret,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code',
  });

  return fetch(URLS.token(), {
    method: 'post',
    headers: getAppAuthHeader(appId, secret),
    body,
  }).then(response => {
    const { status, statusText, ok } = response;
    if (ok) return response.json();
    return Promise.reject({ status, statusText });
  });
}
