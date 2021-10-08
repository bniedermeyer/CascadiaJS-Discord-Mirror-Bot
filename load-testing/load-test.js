// built with k6 - see https://k6.io/docs/ for more info
import http from 'k6/http';

import { check, group, sleep } from 'k6';


export let options = {
  stages: [
    { duration: '30s', target: 100 }, // simulate ramp-up of traffic from 0 to 100 users over 30 s

    { duration: '1m', target: 200 }, // stay at 100 users for 1 minute

    { duration: '1m', target: 0 }, // ramp-down to 0 users
  ],

  thresholds: {

    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

const url = __ENV.URL;
const token = __ENV.TOKEN;

export default () => {
    const payload = {
        visible: true,
        text: __ITER,
        username: `Worker ${__VU}`,
        email: 'test@test.com',
        created: new Date().toISOString
    }
  const params = {
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  };


    let myObjects = http.post(`${url}`, JSON.stringify(payload), params);



  sleep(1);

};