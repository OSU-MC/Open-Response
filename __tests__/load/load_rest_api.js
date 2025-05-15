import http from 'k6/http';
import { check } from 'k6';
import { setup, BASE_URL } from '../shared/rest_api_k6.js';

export const options = {
  stages: [
    { duration: '1m', target: 30 },     // Baseline usage
    { duration: '2m', target: 150 },    // Gradual ramp to normal high traffic
    { duration: '30s', target: 1000 },  // Short spike to simulate worst-case peak
    { duration: '1m', target: 0 },      // Ramp down to idle
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000', 'p(95)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.001'],                 // <0.1% request failure rate
  },
};

export { setup };

export default function (data) {
    const { headers, user } = data;

    // Dashboard
    const dashRes = http.get(`${BASE_URL}/courses`, {
        headers,
        tags: { name: 'dashboard' },
    });
    check(dashRes, { 'dashboard 200': (r) => r.status === 200 });

    // Questions for a Lecture
    const questionsRes = http.get(`${BASE_URL}/courses/1/lectures/2`, {
        headers,
        tags: { name: 'questions' },
    });
    check(questionsRes, { 'questions 200': (r) => r.status === 200 });

    // Logout
    const logoutRes = http.get(`${BASE_URL}/users/logout`, {
        headers,
        tags: { name: 'logout' },
    });
    check(logoutRes, { 'logout 200': (r) => r.status === 200 });
}
