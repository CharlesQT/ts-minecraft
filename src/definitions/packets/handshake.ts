import { MinecraftNetwork, ServerPacket } from "../network";
import Coders from '../coders'
import { Field, Packet } from "./registry";

@Packet(0x00, 'handshake')
class Handshake implements ServerPacket {
    @Field(Coders.VarInt)
    protocolVersion: number
    @Field(Coders.String)
    serverAddress: string
    @Field(Coders.Short)
    serverPort: number
    @Field(Coders.VarInt)
    nextState: number

    onServer(): void {
        throw new Error("Method not implemented.");
    }
}