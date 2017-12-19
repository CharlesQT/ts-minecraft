import * as packet from '../packets'
import * as net from 'net'
import { Bound } from '../network'
import Tracker from './client-tracker'

export interface ServerOption {
    port?: number
}

export class Server {
    readonly port: number = 25565;
    private server: net.Server;
    private trackers: Tracker[];
    constructor(option?: ServerOption) {
        this.port = option ? option.port || 25565 : 25565;
    }
    start() {
        this.server = net.createServer((sock) => {
            
        });
        this.server.listen(this.port);
    }
    close() {
    }
}