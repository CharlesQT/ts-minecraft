import { Bound } from "../network";
import { Socket } from "net";

class Tracker {
    private bound: Bound;
    constructor(socket: Socket) {
        this.bound = new Bound('server', socket, this.handlePacket);
    }
    private handlePacket(packet: any) {
        if (packet.onClient) {
        }
    }
}

export default Tracker;
