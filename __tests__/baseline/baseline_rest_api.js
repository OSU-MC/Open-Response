// Important API calls only
// 1. login endpoints
// 2. loading dashboard endpoints
// 3. loading live lecture endpoints
// 4. updating live lecture endpoints

import http from 'k6/http';
import { check } from 'k6';
import { setup, BASE_URL } from '../shared/rest_api_k6.js';

export const options = {
    vus: 1,
    iterations: 1,
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
