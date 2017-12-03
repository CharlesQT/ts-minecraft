import { MinecraftNetwork, ServerPacket, ClientPacket } from "../network";
import Coders from '../coders'
import { GameType, Difficulty } from "../../game";
import { SlotData } from "../packet";

export default function create(net: MinecraftNetwork) {
    const Type = net.Type;
    const Packet = net.Packet;

    @Packet(0x00, 'client')
    class KeepAlive implements ClientPacket {
        @Type(Coders.VarInt)
        public value: number

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }

    @Packet(0x01, 'client')
    class LoginGame implements ClientPacket {
        @Type(Coders.Int)
        public entityId: number

        @Type(Coders.UByte)
        public gameMode: GameType

        @Type(Coders.Byte)
        public dimension: number

        @Type(Coders.UByte)
        public difficulty: number

        @Type(Coders.UByte)
        public maxPlayers: number

        @Type(Coders.String)
        public levelType: string

        @Type(Coders.Bool)
        public debug: boolean

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }

    @Packet(0x02, 'client')
    class ChatMessage implements ClientPacket {
        @Type(Coders.Json)
        public content: any

        @Type(Coders.Byte)
        public position: 0 | 1 | 2 // 0: chat, 1: system, 2: floating 

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }

    @Packet(0x03, 'client')
    class TimeUpdate implements ClientPacket {
        @Type(Coders.Long)
        public worldAge: Long

        @Type(Coders.Long)
        public timeOfDay: Long

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }

    @Packet(0x04, 'client')
    class EntityEquip implements ClientPacket {
        @Type(Coders.VarInt)
        public entityId: number

        @Type(Coders.Short)
        public slot: number

        @Type(Coders.Slot)
        public item: SlotData

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }

    @Packet(0x05, 'client')
    class SpawnPoint implements ClientPacket {
        @Type(Coders.Position)
        public position: Position

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }

    @Packet(0x06, 'client')
    class UpdateHealth implements ClientPacket {
        @Type(Coders.Float)
        public health: number

        @Type(Coders.VarInt)
        public hunger: number

        @Type(Coders.Float)
        public saturation: number

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }


    @Packet(0x07, 'client')
    class ReSpawn implements ClientPacket {
        @Type(Coders.Byte)
        public dimension: number

        @Type(Coders.UByte)
        public difficulty: Difficulty

        @Type(Coders.UByte)
        public gamemode: GameType

        @Type(Coders.String)
        public levelType: string

        onClient(): void {
            throw new Error("Method not implemented.");
        }
    }
}
