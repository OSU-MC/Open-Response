import ws from 'k6/ws';
import { check } from 'k6';
import { WS_URL, TEST_LECTURE_ID } from '../shared/websocket_k6.js';

export const options = {
    vus: 1,
    iterations: 1,
};

export default function () {
    const url = WS_URL;

    const res = ws.connect(url, {}, function (socket) {
        socket.on('open', () => {
            socket.send(JSON.stringify({
                event: 'joinLecture',
                data: { lectureId: TEST_LECTURE_ID },
            }));

            socket.setTimeout(() => {
                socket.send(JSON.stringify({
                    event: 'setLiveQuestion',
                    data: { lectureId: TEST_LECTURE_ID },
                }));
            }, 1000); // mimic delay after join
        });

        socket.setTimeout(() => socket.close(), 3000);
    });

    check(res, {
        'status is 101 (WebSocket handshake successful)': (r) => r && r.status === 101,
    });
}
