import { PacketCoder } from "./network";
import * as Long from 'long'
import 'uuid'
import { SlotData } from "./packet";
import { NBT } from "../../index";

const VarInt: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readVarint32(),
    encode: (buffer, inst) => { buffer.writeVarint32(inst) }
}

const Int: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readInt(),
    encode: (buffer, inst) => { buffer.writeInt(inst) }
}

const Byte: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readByte(),
    encode: (buffer, inst) => { buffer.writeByte(inst) }
}

const UByte: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readUint8(),
    encode: (buffer, inst) => { buffer.writeUint8(inst) }
}

const Bool: PacketCoder<boolean> = {
    create: () => false,
    decode: (buffer, inst) => buffer.readByte() === 1,
    encode: (buffer, inst) => { buffer.writeByte(inst ? 1 : 0) }
}

const Float: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readFloat(),
    encode: (buffer, inst) => { buffer.writeFloat(inst) }
}

const Double: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readDouble(),
    encode: (buffer, inst) => { buffer.writeDouble(inst) }
}

const _Position: PacketCoder<Position> = {
    create: () => ({ x: 0, y: 0, z: 0 }),
    decode: (buffer, inst) => {
        const val = buffer.readLong();
        inst.x = val.getHighBits() >> 6;
        inst.y = (val.getHighBits() << 26 >> 20) | val.getLowBits() >> 26;
        inst.z = val.getLowBits() << 6 >> 6
        return inst;
    },
    encode: (buffer, inst) => {
        const high = inst.x >> 6 | ((inst.y >> 6) & 0x3F)
        const low = (inst.y & 0x3F) | inst.z << 6 >> 6;
        return new Long(low, high);
    }
}

const UUID: PacketCoder<string> = {
    create: () => '',
    decode: (buffer, inst) => {
        const makeDigit = (hex: string, digit: number) => {
            if (hex.length < digit) {
                let d = ''
                for (let i = 0; i < digit - hex.length; i += 1)
                    d += 0;
                return `${d}${hex}`
            }
            return hex;
        }
        const hi = buffer.readUint64();
        const lo = buffer.readUint64();
        const a = makeDigit(hi.shiftRight(32).toString(16), 8);
        const b = makeDigit(hi.shiftRight(16).and(0xFFFF).toString(16), 4)
        const c = makeDigit(hi.and(0xFFFF).toString(16), 4)
        const d = makeDigit(lo.shiftRight(48).and(0xFFFF).toString(16), 4)
        const e = makeDigit(lo.and(0xFFFFFFFFFFFF).toString(16), 12)

        return `${a}-${b}-${c}-${d}-${e}`
    },
    encode: (buffer, inst) => {
        const components = inst.split('-')
        if (components.length != 5) throw new Error('Invalid UUID')
        let hi = Long.fromString(components[0], false, 16)
        hi = hi.shiftLeft(16)
        hi = hi.or(Long.fromString(components[1], false, 16))
        hi = hi.shiftLeft(16)
        hi = hi.or(Long.fromString(components[2], false, 16))

        let lo = Long.fromString(components[3], false, 16)
        lo = lo.shiftLeft(48)
        lo = lo.or(Long.fromString(components[4], false, 16))

        buffer.writeUint64(hi)
        buffer.writeUint64(lo)
    }
}

const Short: PacketCoder<number> = {
    create: () => 0,
    decode: (buffer, inst) => buffer.readShort(),
    encode: (buffer, inst) => { buffer.writeShort(inst) }
}

const VarLong: PacketCoder<Long> = {
    create: () => new Long(0),
    decode: (buffer, inst) => buffer.readLong(),
    encode: (buffer, inst) => { buffer.writeInt64(inst) }
}

const String: PacketCoder<string> = {
    create: () => '',
    decode: (buffer, inst) => {
        const len = buffer.readByte()
        return buffer.readUTF8String(len);
    },
    encode: (buffer, inst) => {
        buffer.writeByte(inst.length)
        buffer.writeUTF8String(inst)
    }
}

const Json: PacketCoder<any> = {
    create: () => ({}),
    decode: (buffer, inst) => {
        return JSON.parse(String.decode(buffer, ''));
    },
    encode: (buffer, inst) => {
        String.encode(buffer, JSON.stringify(inst))
    }
}

const Slot: PacketCoder<SlotData> = {
    create: () => ({ blockId: 0 }),
    decode: (buffer, inst) => {
        const blockId = Short.decode(buffer, 0)
        if (blockId === -1) return { blockId }
        const itemCount = Byte.decode(buffer, 0)
        const itemDamage = Short.decode(buffer, 0)
        if (Byte.decode(buffer, 0) === 0)
            return {
                blockId,
                itemCount,
                itemDamage,
            }
        return {
            blockId,
            itemCount,
            itemDamage,
            nbt: NBT.Persistence.readRoot(Buffer.from(buffer.buffer))
        }
    },
    encode: (buffer, inst) => {
        String.encode(buffer, JSON.stringify(inst))
    }
}

export default {
    Json, VarInt, Long, Slot, VarLong, String, Short, UByte, Byte, Bool, Float, Double, Position: _Position, UUID, Int
}