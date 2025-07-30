import axios from 'axios';
import dotenv from 'dotenv';
import { setMaxIdleHTTPParsers } from 'http';

dotenv.config();

const API_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;

let data = [];
const high_risk_patients = new Set();
const fever_patients = new Set();
const data_quality_issues = new Set();

const getPatients = async (page = 1, limit = 20) => {
  let hasNext = true;
  while (hasNext) {
    try {
      const response = await axios.get(API_URL + '/patients', {
        params: { page, limit },
        headers: {
          'x-api-key': API_KEY,
        },
      });

      hasNext = response.data.pagination.hasNext;

      data.push(...response.data.data);

      page++;
      sleep(10);
    } catch (e) {}
  }

  return data;
};

const bloodPressureRisk = (person) => {
  const blood_pressure = person.blood_pressure;
  if (!blood_pressure || !blood_pressure.includes('/')) {
    data_quality_issues.add(person.patient_id);
    return 0;
  }

  const [systolicStr, diastolicStr] = blood_pressure.split('/');

  const systolic = parseInt(systolicStr, 10);
  const diastolic = parseInt(diastolicStr, 10);

  if (isNaN(systolic) || isNaN(diastolic)) {
    data_quality_issues.add(person.patient_id);
    return 0;
  }

  if (systolic < 120 && diastolic < 80) {
    return 0;
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 1;
  } else if (
    (systolic >= 130 && systolic <= 139) ||
    (diastolic >= 80 && diastolic <= 89)
  ) {
    return 2;
  } else if (systolic >= 140 || diastolic >= 90) {
    return 3;
  } else {
    return 0;
  }
};

const temperatureRisk = (person) => {
  const temp = parseFloat(person.temperature);

  if (isNaN(temp)) {
    data_quality_issues.add(person.patient_id);

    return 0;
  }

  if (temp <= 99.5) {
    return 0;
  } else if (temp >= 99.6 && temp <= 100.9) {
    fever_patients.add(person.patient_id);
    return 1;
  } else if (temp >= 101) {
    fever_patients.add(person.patient_id);
    return 2;
  }

  return 0;
};

const ageRisk = (person) => {
  const age = parseInt(person.age);

  if (isNaN(age)) {
    data_quality_issues.add(person.patient_id);

    return 0;
  }

  if (age < 40) {
    return 0;
  } else if (age >= 40 && age <= 65) {
    return 1;
  } else if (age > 65) {
    return 2;
  }

  return 0;
};

const highRiskPatients = (data) => {
  let total_risk_score = 0;

  data.forEach((person) => {
    total_risk_score = 0;

    total_risk_score += bloodPressureRisk(person);
    total_risk_score += temperatureRisk(person);
    total_risk_score += ageRisk(person);

    if (total_risk_score >= 4) {
      high_risk_patients.add(person.patient_id);
    }
  });
};

getPatients().then((data) => {
  highRiskPatients(data);

  console.log(high_risk_patients);
  console.log(fever_patients);
  console.log(data_quality_issues);
});
