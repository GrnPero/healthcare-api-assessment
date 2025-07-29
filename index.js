import axios from 'axios'
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;


async function fetchPatients(page = 1, limit = 10) {
  const response = await axios.get(API_URL + '/patients', {
    params: { page, limit },
    headers: {
      'x-api-key': API_KEY,
    },
  });

  return response.data;
}

fetchPatients()
  .then(data => {
    console.log('Patients:', data);
  })