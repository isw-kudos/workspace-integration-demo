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
  return getRelevantXkcd(search).then(comics => {
    if (comics.length) {
      const comic = comics[0];
      const text = `*[${comic.title}](https://${comic.url})*
        Searched for _"${search}"_`;

      return sendMessage(
        {
          spaceId,
          title: 'posted a relevant XKCD',
          actorName: userName,
          actorAvatar: URLS.photo(userId),
          text,
        },
        token
      ).then(() => ({
        title: 'A relevant xkcd was shared!',
        text,
      }));
    }
    //if no xkcd found
    return Promise.resolve({
      title: 'No relevant xkcd',
      text: `No results found for _"${search}"_. Have you somehow found a situation _without_ a relevant XKCD?!`,
    });
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
