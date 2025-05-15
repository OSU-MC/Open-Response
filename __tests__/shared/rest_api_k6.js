import http from 'k6/http';

export const BASE_URL = 'http://localhost:3001'; // adjust as needed
const LOGIN_URL = `${BASE_URL}/users/login`;

const USER_CREDENTIALS = {
  email: 'teacheruser@open-response.org',
  rawPassword: 'teacherteacher',
};

export function setup() {
  const res = http.post(LOGIN_URL, JSON.stringify(USER_CREDENTIALS), {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'login' },
  });

  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} - ${res.body}`);
  }

  // Extract cookies
  const cookies = res.cookies;
  const jwtCookie = cookies._openresponse_session?.[0]?.value;
  const csrfCookie = cookies['xsrf-token']?.[0]?.value;

  if (!jwtCookie || !csrfCookie) {
    throw new Error('Missing required cookies for authentication');
  }

  return {
    headers: {
      '_openresponse_session': jwtCookie,
      'xsrf-token': csrfCookie,
    },
    user: res.json('user'),
  };
}
