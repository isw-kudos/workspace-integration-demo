import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { URLS } from './utils';
import sendMessage from './message';

export default function postRelevantXkcd({
  search,
  userId,
  userName,
  spaceId,
  token,
}) {
  getRelevantXkcd(search).then(comics => {
    if (comics.length) {
      const comic = comics[0];
      sendMessage(
        {
          spaceId,
          title: 'posted a relevant XKCD',
          actorName: userName,
          actorAvatar: URLS.photo(userId),
          text: `*[${comic.title}](https://${comic.url})*
          Searched for _"${search}"_`,
        },
        token
      );
    }
  });
}

function getRelevantXkcd(search) {
  const body = new URLSearchParams();
  body.append('search', search);
  return fetch('http://localhost:8080/search', {
    method: 'post',
    body,
  })
    .then(response => {
      if (response.ok) return response.json();
      return Promise.reject(response);
    })
    .then(json => json.results);
}
