import { Bound, ServerPacket } from "../network";
import Coders from '../coders'
import { Field, Packet } from "./registry";

@Packet(0x00, 'handshake')
export class Handshake implements ServerPacket {
    @Field(Coders.VarInt)
    protocolVersion: number
    @Field(Coders.String)
    serverAddress: string
    @Field(Coders.Short)
    serverPort: number
    @Field(Coders.VarInt)
    nextState: number

    onServer(): void {
        if (this.nextState === 1) {

        } else if (this.nextState === 2) {

        } else {
            console.error(`Unexpected next state ${this.nextState}.`);
        }
    }
}