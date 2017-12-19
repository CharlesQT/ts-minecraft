import { ServerPacket, ClientPacket, BiPacket } from "../network";
import { Packet as packet, Field } from "./registry";
import Coders from '../coders'

const Packet = (id: number) => packet(id, 'login')

@Packet(0x00)
export class LoginStart implements ServerPacket {
    @Field(Coders.String)
    playerName: string

    onServer(): void {
        throw new Error("Method not implemented.");
    }
}


@Packet(0x00)
export class Disconnect implements ClientPacket {
    @Field(Coders.Json)
    data: any
    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x01)
export class OnEncrypt implements BiPacket {

    @Field(Coders.ByteArray)
    secret: Int8Array
    @Field(Coders.ByteArray)
    token: Int8Array
    onServer(): void {
        throw new Error("Method not implemented.");
    }
    onClient(): void {
        throw new Error("Method not implemented.");
    }
}


@Packet(0x02)
export class LoginSucsess implements ClientPacket {
    @Field(Coders.String)
    uuid: string
    @Field(Coders.String)
    username: string
    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x03)
export class EnableCompression implements ClientPacket {
    @Field(Coders.VarInt)
    threadhold: number
    onClient(): void {
        throw new Error("Method not implemented.");
    }
}