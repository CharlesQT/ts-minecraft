import { MinecraftNetwork, ServerPacket, ClientPacket, BiPacket, Side } from "../network";
import Coders from '../coders'
import { Server } from "../../server";
import { Packet as packet, Field } from "./registry";

const Packet = (num: number) => packet(num, 'status')

@Packet(0x00)
class ServerQuery implements BiPacket {
    @Field(Coders.Json, 'client')
    status: Server.StatusFrame

    onServer(): void {
        throw new Error("Method not implemented.");
    }

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x01)
class Ping implements BiPacket {
    @Field(Coders.Long)
    ping: Long

    onClient(): void {
        throw new Error("Method not implemented.");
    }
    onServer(): void {
        throw new Error("Method not implemented.");
    }

}