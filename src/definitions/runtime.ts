import * as packet from './packets'
import * as net from 'net'
import { Bound } from './network'

export namespace Minecraft {
    export function createServer(port: number = 25565) {
        const server = net.createServer((sock) => {
            new Bound('server', sock);
        });
        server.listen(port);
        console.log(server.address);
    }
}