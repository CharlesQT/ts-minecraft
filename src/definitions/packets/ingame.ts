import { Bound, ServerPacket, ClientPacket } from "../network";
import Coders from '../coders'
import { GameType, Difficulty } from "../../game";
import { SlotData } from "../packet";
import { Packet as packet, Field } from "./registry";

const Packet = (id: number) => packet(id, 'login')

@Packet(0x00)
class KeepAlive implements ClientPacket {
    @Field(Coders.VarInt)
    public value: number

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x01)
class LoginGame implements ClientPacket {
    @Field(Coders.Int)
    public entityId: number

    @Field(Coders.UByte)
    public gameMode: GameType

    @Field(Coders.Byte)
    public dimension: number

    @Field(Coders.UByte)
    public difficulty: number

    @Field(Coders.UByte)
    public maxPlayers: number

    @Field(Coders.String)
    public levelType: string

    @Field(Coders.Bool)
    public debug: boolean

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x02)
class ChatMessage implements ClientPacket {
    @Field(Coders.Json)
    public content: any

    @Field(Coders.Byte)
    public position: 0 | 1 | 2 // 0: chat, 1: system, 2: floating 

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x03)
class TimeUpdate implements ClientPacket {
    @Field(Coders.Long)
    public worldAge: Long

    @Field(Coders.Long)
    public timeOfDay: Long

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x04)
class EntityEquip implements ClientPacket {
    @Field(Coders.VarInt)
    public entityId: number

    @Field(Coders.Short)
    public slot: number

    @Field(Coders.Slot)
    public item: SlotData

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x05)
class SpawnPoint implements ClientPacket {
    @Field(Coders.Position)
    public position: Position

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}

@Packet(0x06)
class UpdateHealth implements ClientPacket {
    @Field(Coders.Float)
    public health: number

    @Field(Coders.VarInt)
    public hunger: number

    @Field(Coders.Float)
    public saturation: number

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}


@Packet(0x07)
class ReSpawn implements ClientPacket {
    @Field(Coders.Byte)
    public dimension: number

    @Field(Coders.UByte)
    public difficulty: Difficulty

    @Field(Coders.UByte)
    public gamemode: GameType

    @Field(Coders.String)
    public levelType: string

    onClient(): void {
        throw new Error("Method not implemented.");
    }
}
