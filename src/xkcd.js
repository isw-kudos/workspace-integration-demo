import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { URLS } from './utils';
import sendMessage from './message';

const cache = {};

export default function postRelevantXkcd({
  search,
  userId,
  userName,
  spaceId,
  token,
}) {
  //if search starts with confirm-comic, get the comicId and the search str
  const confirmed = search.match(/^\s*confirm-comic ([0-9]+) (.*)/);

  //if comic is not confirmed search and send options to user
  if (!confirmed) {
    return searchAndConfirm(search);
  }

  //if confirmed post comic and send confirmation to user
  //use second regex match group as search
  search = confirmed[2].trim();
  //use first regex match group as id
  const id = confirmed[1].trim();
  const comic = cache[id];
  //if comic is not found return error message
  if (!comic) return Promise.reject({ text: 'Invalid comic number' });

  //post message
  const message = {
    spaceId,
    title: 'posted a relevant XKCD!',
    actorName: userName,
    actorAvatar: URLS.photo(userId),
    text: `*[${comic.title}](https://${comic.url})*
        Searched for _"${search}"_`,
  };

  return sendMessage(message, token).then(() => ({
    title: 'A relevant xkcd was shared!',
    text: message.text,
  }));
}

function searchAndConfirm(search) {
  return getRelevantXkcd(search).then(comics => {
    //if no relevant xkcd found
    if (!comics.length)
      return {
        title: 'No relevant xkcd',
        text: `No results found for _"${search}"_. Have you somehow found a situation _without_ a relevant XKCD?!`,
      };

    //send options to user and add options to cache
    return comics.map(comic => {
      const { number, title, date, url } = comic;
      const id = '' + number;
      cache[id] = comic;

      //GOTCHA - all fields are required for cards to work!
      return {
        title,
        subtitle: '#' + id,
        text: url,
        date: '' + new Date(date).getTime(),
        buttons: [
          {
            style: 'PRIMARY',
            text: 'Share',
            payload: `/xkcd confirm-comic ${id} ${search}`,
          },
        ],
      };
    });
  });
}

function getRelevantXkcd(search) {
  const body = new URLSearchParams();
  body.append('search', search);
  //locally running docker image from https://github.com/adtac/relevant-xkcd
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
