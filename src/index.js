import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

const getPatients = async (page = 1, limit = 20) => {
  let data = [];
  let hasNext = true;
  while (hasNext) {
    const response = await axios.get(API_URL + '/patients', {
      params: { page, limit },
      headers: {
        'x-api-key': API_KEY,
      },
    });

    hasNext = response.data.hasNext;

    data.push(response.data.data);
  }

  return data;
};

getPatients().then((data) => console.log(data));
