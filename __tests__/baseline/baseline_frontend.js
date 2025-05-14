// Unauthenticated pages only; we are testing the responsiveness of the frontend server not the api calls

import http from 'k6/http';
import { check } from 'k6';
import { hitEndpoint } from '../shared/frontend_k6.js';

export const options = {
    vus: 1,
    iterations: 1,
};

export default function () {
    const res = hitEndpoint(http);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time is acceptable': (r) => r.timings.duration < 500,
    });
}