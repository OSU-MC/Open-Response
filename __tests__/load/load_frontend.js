import http from 'k6/http';
import { check } from 'k6';
import { hitEndpoint } from '../shared/frontend_k6.js';

export const options = {
  stages: [
    { duration: '1m', target: 30 },     // Baseline usage
    { duration: '2m', target: 150 },    // Gradual ramp to normal high traffic
    { duration: '30s', target: 1000 },  // Short spike to simulate worst-case peak
    { duration: '1m', target: 0 },      // Ramp down to idle
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500', 'p(95)<500'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'],                 // <1% request failure rate
  },
};

export default function () {
  const res = hitEndpoint(http);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 800ms': (r) => r.timings.duration < 800,
  });
}
