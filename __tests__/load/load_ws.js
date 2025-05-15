import ws from 'k6/ws';
import { check } from 'k6';
import { WS_URL, TEST_LECTURE_ID } from '../shared/websocket_k6.js';

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '2m', target: 150 },
    { duration: '30s', target: 1000 },
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const res = ws.connect(WS_URL, {}, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({
        event: 'joinLecture',
        data: { lectureId: TEST_LECTURE_ID },
      }));

      // Wait a second, then emit setLiveQuestion repeatedly (as a stand in for user responses)
      setTimeout(() => {
        const interval = setInterval(() => {
          socket.send(JSON.stringify({
            event: 'setLiveQuestion',
            data: { lectureId: TEST_LECTURE_ID },
          }));
        }, 5000); // simulate ~1 push per user per 5s

        socket.setTimeout(() => {
          clearInterval(interval);
          socket.close();
        }, 20000);
      }, 1000);
    });
  });

  check(res, {
    'WebSocket connected (101)': (r) => r && r.status === 101,
  });
}
