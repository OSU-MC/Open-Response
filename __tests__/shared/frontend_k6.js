export const BASE_URL = 'http://localhost:3000';

export function hitEndpoint(http) {
    return http.get(`${BASE_URL}/login`)
}