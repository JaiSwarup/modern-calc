import {Server} from 'socket.io';
import http from 'http';

declare global {
    var io: Server | undefined;
}

const io = globalThis.io || new Server(http.createServer());