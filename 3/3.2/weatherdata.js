const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

function csvToJson(path) {
    const arr = fs.readFileSync(path, 'utf-8').trim().split('\n').map(place => {return place.split(';');});
    const keys = arr[0]
    const pairs = arr.slice(1,-1).map(entry => entry.map((value,index) => value = [keys[index],value]))
    return pairs.map(entry => Object.fromEntries(entry))
}

const plzArr = csvToJson('3/3.2/AMTOVZ_CSV_LV95.csv')

function findZipIDByName(arr, name) {
    return arr[arr.findIndex(place => place.Ortschaftsname === name)].PLZ4;
};

async function getWeather(zip) {
  const url = `https://app-prod-ws.meteoswiss-app.ch/v1/plzDetail?plz=${zip}00`;

  try {
    const response = await fetch(url);
    if (response.status !== 200) {
      console.error(response.status);
    }
    else {
      const data = await response.json();
      console.log(data);
      return data;
    }
  } catch(error) {
    console.error(error);
  }
}

app.get('/weather/:location', async (request, response) => {
  response.send(await getWeather(findZipIDByName(plzArr, request.params.location)));
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


console.log(getWeather(findZipIDByName(plzArr, 'Lausanne')))
console.log(findZipIDByName(plzArr,'Lausanne'))