const axios = require('axios');
const moment = require('moment'); //npm package to transform data unix format
const url =
  'http://api.tvmaze.com/singlesearch/shows?q=stranger-things&embed=episodes';
//Fetch the data using npm package axios
const sendRequest = () => {
  axios
    .get(url)
    .then(processResponse)
    .catch(handleError);
};
//get the data response from url
const processResponse = response => {
  let id = response.data.id;
  let show = response.data._embedded.episodes;

  let episodes = show.map(mapper);
  //Build the result reformat Json as an Obj
  const obj = {
    [id]: {
      totalDuration: totalDuration(show),
      averageEpisodesPerSeson: episodes.length / totalSesons(show)
    }
  };

  obj[id].episodes = episodes;
//I left the console log just you to see the results while testing is not working properly
//I have to console log because console.log obj will display the episode but in short format [Object][Object] while is too much info
  console.log(obj)
  console.log(obj[id].episodes);

  return obj;
};

//Handle Errors
const handleError = err => {
  if (err.response) {
    console.log('Problem with Response', err.response.status);
  } else if (err.request) {
    console.log('Problem with Request!');
  } else {
    console.log('Error', err.message);
  }
};

//Calculate total duration of show
const totalDuration = episode => {
  let result = 0;
  episode.forEach(element => {
    result += element.runtime * 60;
  });
  return result;
};

//calculate total number of episodes in show
const totalSesons = episode => {
  let total = {};
  for (let i = 0; i < episode.length; i++) {
    total[episode[i].season] = 1 + (total[episode[i].season] || 0);
  }

  return count(total);
};
//number of seasons
const count = obj => {
  return Object.keys(obj).length;
};

//function that returns the first sentence of the summary, without HTML tags
const trimTitle = str => {
  if (str) {
    let sun = str.split('.')[0].slice(str.indexOf('>') + 1, str.length);
    return sun;
  }
  return str;
};
// get the episodes
const mapper = episode => ({
  [episode.id]: {
    sequenceNumber: `s${episode.season}e${episode.number}`,
    shortTitle: episode.name.split(':')[1].trim(),
    airTimeStamp: moment(episode.airstamp).unix() || '0', //Unix Timestamp (seconds)
    shortSummary: trimTitle(episode.summary) || 'No Summmary Provided!'
  }
});
sendRequest();
